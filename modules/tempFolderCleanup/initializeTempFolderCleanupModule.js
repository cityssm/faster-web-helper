import { nodeSchedule } from '@cityssm/scheduled-task';
import { dateToString, dateToTimePeriodString } from '@cityssm/utils-datetime';
import camelCase from 'camelcase';
import Debug from 'debug';
import exitHook from 'exit-hook';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { moduleName } from './helpers/moduleHelpers.js';
import runTempFolderCleanupTask, { taskName as tempFolderCleanupTaskName } from './tasks/tempFolderCleanupTask.js';
const debug = Debug(`${DEBUG_NAMESPACE}:${camelCase(moduleName)}`);
export function initializeTempFolderCleanupTask() {
    debug(`Initializing "${moduleName}"...`);
    const tempFolderCleanupJob = nodeSchedule.scheduleJob(tempFolderCleanupTaskName, getConfigProperty('modules.tempFolderCleanup.schedule'), runTempFolderCleanupTask);
    const tempFolderCleanupFirstRunDate = new Date(tempFolderCleanupJob.nextInvocation());
    debug(`Scheduled to run "${tempFolderCleanupTaskName}" on ${dateToString(tempFolderCleanupFirstRunDate)} at ${dateToTimePeriodString(tempFolderCleanupFirstRunDate)}`);
    /*
     * Set up exit hook
     */
    exitHook(() => {
        tempFolderCleanupJob.cancel();
    });
    debug(`"${moduleName}" initialized.`);
}
