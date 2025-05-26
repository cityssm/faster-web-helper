import { FasterApi } from '@cityssm/faster-api';
import { ScheduledTask } from '@cityssm/scheduled-task';
import camelCase from 'camelcase';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../../../../debug.config.js';
import { getConfigProperty } from '../../../../helpers/config.helpers.js';
import { getMinimumMillisBetweenRuns, getScheduledTaskMinutes } from '../../../../helpers/tasks.helpers.js';
import { moduleName } from '../../helpers/module.helpers.js';
export const taskName = 'Integrity Checker - FASTER Vendors';
const debug = Debug(`${DEBUG_NAMESPACE}:${camelCase(moduleName)}:${camelCase(taskName)}`);
const fasterWebConfig = getConfigProperty('fasterWeb');
async function refreshFasterVendors() {
    if (fasterWebConfig.apiUserName === undefined ||
        fasterWebConfig.apiPassword === undefined) {
        debug('Missing FASTER API user configuration.');
        return;
    }
    /*
     * Call FASTER API
     */
    const fasterApi = new FasterApi(fasterWebConfig.tenantOrBaseUrl, fasterWebConfig.apiUserName, fasterWebConfig.apiPassword);
    const fasterVendorsResponse = await fasterApi.getVendors();
    if (!fasterVendorsResponse.success) {
        debug(`API Error: ${fasterVendorsResponse.error.title}`);
        return;
    }
    debug(`Updating ${fasterVendorsResponse.response.results.length} FASTER vendors...`);
    /*
     * Update FASTER vendors
     */
    const updateSource = getConfigProperty('modules.integrityChecker.fasterVendors.update.source');
    if (updateSource === 'dynamicsGp') {
        const dynamicsGpUpdate = await import('../../helpers/fasterVendors/dynamicsGp.vendorUpdate.js');
        await dynamicsGpUpdate.updateVendorsInFaster(fasterVendorsResponse.response.results);
    }
    else {
        debug(`Unknown update source: ${updateSource}`);
    }
}
const scheduledTask = new ScheduledTask(taskName, refreshFasterVendors, {
    minimumIntervalMillis: getMinimumMillisBetweenRuns('integrityChecker_fasterVendors'),
    schedule: {
        dayOfWeek: getConfigProperty('application.workDays'),
        hour: getConfigProperty('application.workHours'),
        minute: getScheduledTaskMinutes('integrityChecker_fasterVendors'),
        second: 0
    },
    startTask: true
});
/*
 * Run the task on initialization
 */
await scheduledTask.runTask();
