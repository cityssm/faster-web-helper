import { FasterApi } from '@cityssm/faster-api';
import { WorkTechAPI } from '@cityssm/worktech-api';
import camelCase from 'camelcase';
import Debug from 'debug';
import exitHook from 'exit-hook';
import schedule from 'node-schedule';
import { DEBUG_NAMESPACE } from '../../../debug.config.js';
import { getConfigProperty } from '../../../helpers/config.helpers.js';
import { getScheduledTaskMinutes } from '../../../helpers/tasks.helpers.js';
import { moduleName } from '../helpers/module.helpers.js';
export const taskName = 'Active Equipment Task';
const debug = Debug(`${DEBUG_NAMESPACE}:${camelCase(moduleName)}:${camelCase(taskName)}`);
const fasterWebConfig = getConfigProperty('fasterWeb');
const worktechConfig = getConfigProperty('worktech');
async function runEquipmentTask() {
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
    debug(`Finished "${taskName}".`);
}
await runEquipmentTask();
const job = schedule.scheduleJob(taskName, {
    dayOfWeek: getConfigProperty('application.workDays'),
    hour: getConfigProperty('application.workHours'),
    minute: getScheduledTaskMinutes('worktechIntegrity.equipment'),
    second: 0
}, runEquipmentTask);
exitHook(() => {
    try {
        job.cancel();
    }
    catch {
        // ignore
    }
});
