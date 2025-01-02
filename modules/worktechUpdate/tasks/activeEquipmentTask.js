import { FasterApi } from '@cityssm/faster-api';
import { WorkTechAPI } from '@cityssm/worktech-api';
import camelCase from 'camelcase';
import Debug from 'debug';
import exitHook from 'exit-hook';
import schedule from 'node-schedule';
import { getConfigProperty } from '../../../helpers/config.functions.js';
import { getScheduledTaskMinutes } from '../../../helpers/tasks.functions.js';
import { moduleName } from '../helpers/moduleHelpers.js';
export const taskName = 'Active Equipment Task';
const debug = Debug(`faster-web-helper:${camelCase(moduleName)}:${camelCase(taskName)}`);
const fasterWebConfig = getConfigProperty('fasterWeb');
const worktechConfig = getConfigProperty('worktech');
async function runActiveEquipmentTask() {
    if (fasterWebConfig.apiUserName === undefined ||
        fasterWebConfig.apiPassword === undefined) {
        debug('Missing FASTER API user configuration.');
        return;
    }
    if (worktechConfig === undefined) {
        debug('Missing Worktech configuration.');
        return;
    }
    debug(`Running "${taskName}"...`);
    const worktech = new WorkTechAPI(worktechConfig);
    /*
     * Call FASTER API
     */
    const fasterApi = new FasterApi(fasterWebConfig.tenantOrBaseUrl, fasterWebConfig.apiUserName, fasterWebConfig.apiPassword);
    const fasterAssetsResponse = await fasterApi.getActiveAssets();
    if (!fasterAssetsResponse.success) {
        debug(`API Error: ${fasterAssetsResponse.error.title}`);
        return;
    }
    debug(`Syncing ${fasterAssetsResponse.response.results.length} asset(s)...`);
    for (const fasterAsset of fasterAssetsResponse.response.results) {
        const worktechEquipment = await worktech.getEquipmentByEquipmentId(fasterAsset.assetNumber);
        if (worktechEquipment === undefined) {
            // add equipment
        }
    }
    debug(`Finished "${taskName}".`);
}
await runActiveEquipmentTask();
const job = schedule.scheduleJob(taskName, {
    dayOfWeek: getConfigProperty('application.workDays'),
    hour: getConfigProperty('application.workHours'),
    minute: getScheduledTaskMinutes('worktechUpdate.activeEquipment'),
    second: 0
}, runActiveEquipmentTask);
exitHook(() => {
    try {
        job.cancel();
    }
    catch {
        // ignore
    }
});
