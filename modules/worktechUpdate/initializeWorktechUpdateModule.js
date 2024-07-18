import { dateToString, dateToTimePeriodString } from '@cityssm/utils-datetime';
import camelCase from 'camelcase';
import Debug from 'debug';
import exitHook from 'exit-hook';
import schedule from 'node-schedule';
import { getConfigProperty } from '../../helpers/functions.config.js';
import { initializeWorktechUpdateDatabase } from './database/databaseHelpers.js';
import { moduleName } from './helpers/moduleHelpers.js';
import cleanupDatabaseTask, { taskName as cleanupDatabaseTaskName } from './tasks/cleanupDatabaseTask.js';
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
        debug(`Running "${cleanupDatabaseTaskName}" on startup...`);
        cleanupDatabaseTask();
        debug(`Running "${directChargeHelperTaskName}" on startup...`);
        await directChargeHelperTask();
        debug(`Running "${inventoryTransactionsTaskName}" on startup...`);
        await inventoryTransactionsTask();
    }
    /*
     * Schedule Direct Charge Helper Job
     */
    const directChargeHelperJob = schedule.scheduleJob(directChargeHelperTaskName, directChargeTransactionsConfig.schedule, directChargeHelperTask);
    const directChargeHelperFirstRunDate = new Date(directChargeHelperJob.nextInvocation().getTime());
    debug(`Scheduled to run "${directChargeHelperTaskName}" on ${dateToString(directChargeHelperFirstRunDate)} at ${dateToTimePeriodString(directChargeHelperFirstRunDate)}`);
    /*
     * Schedule Inventory Transactions Job
     */
    const inventoryTransactionsJob = schedule.scheduleJob(inventoryTransactionsTaskName, inventoryTransactionsConfig.schedule, inventoryTransactionsTask);
    const inventoryTransactionsFirstRunDate = new Date(inventoryTransactionsJob.nextInvocation().getTime());
    debug(`Scheduled to run "${inventoryTransactionsTaskName}" on ${dateToString(inventoryTransactionsFirstRunDate)} at ${dateToTimePeriodString(inventoryTransactionsFirstRunDate)}`);
    /*
     * Schedule Cleanup Database Job
     */
    const cleanupDatabaseJob = schedule.scheduleJob(cleanupDatabaseTaskName, {
        date: 1,
        hour: 0
    }, cleanupDatabaseTask);
    const cleanupDatabaseFirstRunDate = new Date(cleanupDatabaseJob.nextInvocation().getTime());
    debug(`Scheduled to run "${cleanupDatabaseTaskName}" on ${dateToString(cleanupDatabaseFirstRunDate)} at ${dateToTimePeriodString(cleanupDatabaseFirstRunDate)}`);
    /*
     * Set up exit hook
     */
    exitHook(() => {
        directChargeHelperJob.cancel();
        inventoryTransactionsJob.cancel();
        cleanupDatabaseJob.cancel();
    });
    debug(`"${moduleName}" initialized.`);
}
