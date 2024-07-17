import Debug from 'debug';
import { asyncExitHook } from 'exit-hook';
import schedule from 'node-schedule';
import { getConfigProperty } from './helpers/functions.config.js';
import initializeWorktechUpdateModule from './modules/worktechUpdate/initializeWorktechUpdateModule.js';
const debug = Debug('faster-web-helper:app');
if (getConfigProperty('modules.inventoryScanner.isEnabled')) {
    debug('Initializing Inventory Scanner');
}
if (getConfigProperty('modules.worktechUpdate.isEnabled')) {
    await initializeWorktechUpdateModule();
}
asyncExitHook(async () => {
    await schedule.gracefulShutdown();
}, {
    wait: 500
});
