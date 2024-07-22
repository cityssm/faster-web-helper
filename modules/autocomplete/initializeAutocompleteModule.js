import path from 'node:path';
import { dateToString, dateToTimePeriodString } from '@cityssm/utils-datetime';
import camelCase from 'camelcase';
import Debug from 'debug';
import exitHook from 'exit-hook';
import express from 'express';
import schedule from 'node-schedule';
import { getConfigProperty } from '../../helpers/functions.config.js';
import { moduleName } from './helpers/moduleHelpers.js';
import runUpdateFilesTask, { taskName as updateFilesTaskName } from './tasks/updateFilesTask.js';
const debug = Debug(`faster-web-helper:${camelCase(moduleName)}`);
const itemNumbersConfig = getConfigProperty('modules.autocomplete.reports.w200');
export default async function initializeAutocompleteModule(app) {
    debug(`Initializing "${moduleName}"...`);
    /*
     * Set up static server
     */
    app.use(getConfigProperty('webServer.urlPrefix') + '/autocomplete', express.static(path.join('public', 'autocomplete')));
    /*
     * Run startup tasks
     */
    if (getConfigProperty('modules.autocomplete.runOnStartup')) {
        debug(`Running "${updateFilesTaskName}" on startup...`);
        await runUpdateFilesTask();
    }
    /*
     * Schedule Update Files Job
     */
    const updateFilesJob = schedule.scheduleJob(updateFilesTaskName, itemNumbersConfig.schedule, runUpdateFilesTask);
    const updateFilesFirstRunDate = new Date(updateFilesJob.nextInvocation().getTime());
    debug(`Scheduled to run "${updateFilesTaskName}" on ${dateToString(updateFilesFirstRunDate)} at ${dateToTimePeriodString(updateFilesFirstRunDate)}`);
    /*
     * Set up exit hook
     */
    exitHook(() => {
        updateFilesJob.cancel();
    });
    debug(`"${moduleName}" initialized.`);
}
