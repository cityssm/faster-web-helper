import Debug from 'debug';
import exitHook from 'exit-hook';
import schedule from 'node-schedule';
import { getConfigProperty } from '../../helpers/functions.config.js';
import { initializeWorktechUpdateDatabase } from './database/databaseHelpers.js';
import directChargeHelperTask, { taskName as directChangeHelperTaskName } from './tasks/directChargeHelperTask.js';
import inventoryTransactionsTask from './tasks/inventoryTransactionsTask.js';
const debug = Debug('faster-web-helper:worktechUpdate');
const directChargeTransactionsConfig = getConfigProperty('modules.worktechUpdate.reports.w217');
const inventoryTransactionsConfig = getConfigProperty('modules.worktechUpdate.reports.w223');
export default async function initializeWorktechUpdateModule() {
    debug('Initializing "Worktech Update Module"...');
    /*
     * Ensure the local database is available.
     */
    initializeWorktechUpdateDatabase();
    /*
     * Direct Charge Helper Task
     */
    debug('Running "Direct Charge Helper Task" on startup...');
    await directChargeHelperTask();
    debug('Scheduling "Direct Charge Helper Task"...');
    const directChargeHelperJob = schedule.scheduleJob(directChangeHelperTaskName, directChargeTransactionsConfig.schedule, directChargeHelperTask);
    /*
     * Inventory Transactions Task
     */
    debug('Running "Inventory Transactions Task" on startup...');
    await inventoryTransactionsTask();
    debug('Scheduling "Inventory Transactions Task"...');
    const inventoryTransactionsJob = schedule.scheduleJob('inventoryTransactionsTask', inventoryTransactionsConfig.schedule, inventoryTransactionsTask);
    /*
     * Set up exit hook
     */
    debug('Initializing exit hook...');
    exitHook(() => {
        directChargeHelperJob.cancel();
        inventoryTransactionsJob.cancel();
    });
    debug('"Worktech Update Module" initialized.');
}
