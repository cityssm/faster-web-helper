import { fork } from 'node:child_process';
import camelCase from 'camelcase';
import Debug from 'debug';
import exitHook from 'exit-hook';
import { getConfigProperty } from '../../helpers/functions.config.js';
import { hasFasterApi } from '../../helpers/helpers.faster.js';
import { moduleName } from './helpers/moduleHelpers.js';
const debug = Debug(`faster-web-helper:${camelCase(moduleName)}`);
export default function initializeWorktechUpdateModule(_options) {
    debug(`Initializing "${moduleName}"...`);
    if (getConfigProperty('worktech') === undefined) {
        debug('WorkTech configuration is not set up. Skipping module initialization.');
        return;
    }
    const childProcesses = [];
    /*
     * Active Equipment
     */
    // eslint-disable-next-line no-secrets/no-secrets
    if (getConfigProperty('modules.worktechUpdate.activeEquipment.isEnabled')) {
        if (hasFasterApi) {
            const taskPath = './modules/worktechUpdate/tasks/activeEquipmentTask.js';
            childProcesses.push(fork(taskPath));
        }
        else {
            debug('Optional "@cityssm/faster-api" package is required for active equipment syncing.');
        }
    }
    /*
     * Set up exit hook
     */
    exitHook(() => {
        for (const childProcess of childProcesses) {
            childProcess.kill();
        }
    });
    debug(`"${moduleName}" initialized.`);
}
