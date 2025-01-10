import cluster from 'node:cluster';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { secondsToMillis } from '@cityssm/to-millis';
import Debug from 'debug';
import { asyncExitHook } from 'exit-hook';
import schedule from 'node-schedule';
import { registerChildProcesses, relayMessageToChildProcess } from './helpers/childProcesses.helpers.js';
import { getConfigProperty } from './helpers/config.functions.js';
const debug = Debug(`faster-web-helper:www:${process.pid}`);
const directoryName = path.dirname(fileURLToPath(import.meta.url));
process.title = `Faster Web Helper (Primary)`;
debug(`Primary pid:   ${process.pid}`);
debug(`Primary title: ${process.title}`);
/**
 * Initialize module tasks
 */
async function initializeModuleTasks() {
    const promises = [];
    if (getConfigProperty('modules.autocomplete.isEnabled')) {
        const initializeAutocompleteModule = await import('./modules/autocomplete/initializeAutocompleteModule.js');
        promises.push(initializeAutocompleteModule.initializeAutocompleteTasks());
    }
    if (getConfigProperty('modules.inventoryScanner.isEnabled')) {
        const initializeInventoryScannerModule = await import('./modules/inventoryScanner/initializeInventoryScanner.js');
        const childProcesses = initializeInventoryScannerModule.initializeInventoryScannerTasks();
        registerChildProcesses(childProcesses);
    }
    if (getConfigProperty('modules.tempFolderCleanup.isEnabled')) {
        const initializeTempFolderCleanupModule = await import('./modules/tempFolderCleanup/initializeTempFolderCleanupModule.js');
        initializeTempFolderCleanupModule.initializeTempFolderCleanupTask();
    }
    if (getConfigProperty('modules.worktechUpdate.isEnabled')) {
        const initializeWorktechUpdateModule = await import('./modules/worktechUpdate/initializeWorktechUpdate.js');
        initializeWorktechUpdateModule.initializeWorktechUpdateTasks();
    }
    await Promise.all(promises);
    asyncExitHook(async () => {
        await schedule.gracefulShutdown();
    }, {
        wait: secondsToMillis(1)
    });
}
/**
 * Initialize app workers
 */
function initializeAppWorkers() {
    const processCount = Math.min(os.cpus().length, 4);
    debug(`Launching ${processCount} web app processes`);
    const clusterSettings = {
        exec: `${directoryName}/app/appProcess.js`
    };
    cluster.setupPrimary(clusterSettings);
    const activeWorkers = new Map();
    for (let index = 0; index < processCount; index += 1) {
        const worker = cluster.fork();
        activeWorkers.set(worker.process.pid ?? 0, worker);
    }
    cluster.on('message', (worker, message) => {
        debug(`Received message from worker: ${worker.process.pid}`);
        if (message.destinationTaskName === 'app') {
            for (const [pid, activeWorker] of activeWorkers.entries()) {
                if (pid === worker.process.pid) {
                    continue;
                }
                debug(`Relaying message to worker: ${pid}`);
                activeWorker.send(message);
            }
        }
        else {
            relayMessageToChildProcess(message);
        }
    });
    cluster.on('exit', (worker) => {
        debug(`Worker ${(worker.process.pid ?? 0).toString()} has been killed`);
        activeWorkers.delete(worker.process.pid ?? 0);
        debug('Starting another worker');
        const newWorker = cluster.fork();
        activeWorkers.set(newWorker.process.pid ?? 0, newWorker);
    });
}
await initializeModuleTasks();
initializeAppWorkers();
