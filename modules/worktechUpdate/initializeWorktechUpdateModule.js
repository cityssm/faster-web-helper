import { dateToString, dateToTimePeriodString } from '@cityssm/utils-datetime';
import camelCase from 'camelcase';
import Debug from 'debug';
import exitHook from 'exit-hook';
import schedule from 'node-schedule';
import { getConfigProperty } from '../../helpers/functions.config.js';
import { initializeWorktechUpdateDatabase } from './database/databaseHelpers.js';
import { moduleName } from './helpers/moduleHelpers.js';
import directChargeHelperTask, { taskName as directChargeHelperTaskName } from './tasks/directChargeHelperTask.js';
import inventoryTransactionsTask, { taskName as inventoryTransactionsTaskName } from './tasks/inventoryTransactionsTask.js';
const debug = Debug(`faster-web-helper:${camelCase(moduleName)}`);
const directChargeTransactionsConfig = getConfigProperty('modules.worktechUpdate.reports.w217');
const inventoryTransactionsConfig = getConfigProperty('modules.worktechUpdate.reports.w223');
export default async function initializeWorktechUpdateModule() {
    debug(`Initializing "${moduleName}"...`);
    /*
     * Ensure the local database is available.
     */
    initializeWorktechUpdateDatabase();
    /*
     * Run on startup
     */
    if (getConfigProperty('modules.worktechUpdate.runOnStartup')) {
        debug(`Running "${directChargeHelperTaskName}" on startup...`);
        await directChargeHelperTask();
        debug(`Running "${inventoryTransactionsTaskName}" on startup...`);
        await inventoryTransactionsTask();
    }
    /*
     * Schedule jobs
     */
    debug(`Scheduling "${directChargeHelperTaskName}"...`);
    const directChargeHelperJob = schedule.scheduleJob(directChargeHelperTaskName, directChargeTransactionsConfig.schedule, directChargeHelperTask);
    const directChargeHelperFirstRunDate = new Date(directChargeHelperJob.nextInvocation().getTime());
    debug(`Scheduled to run "${directChargeHelperTaskName}" on ${dateToString(directChargeHelperFirstRunDate)} at ${dateToTimePeriodString(directChargeHelperFirstRunDate)}`);
    debug(`Scheduling "${inventoryTransactionsTaskName}"...`);
    const inventoryTransactionsJob = schedule.scheduleJob(inventoryTransactionsTaskName, inventoryTransactionsConfig.schedule, inventoryTransactionsTask);
    const inventoryTransactionsFirstRunDate = new Date(inventoryTransactionsJob.nextInvocation().getTime());
    debug(`Scheduled to run "${inventoryTransactionsTaskName}" on ${dateToString(inventoryTransactionsFirstRunDate)} at ${dateToTimePeriodString(inventoryTransactionsFirstRunDate)}`);
    /*
     * Set up exit hook
     */
    debug('Initializing exit hook...');
    exitHook(() => {
        directChargeHelperJob.cancel();
        inventoryTransactionsJob.cancel();
    });
    debug(`"${moduleName}" initialized.`);
}
