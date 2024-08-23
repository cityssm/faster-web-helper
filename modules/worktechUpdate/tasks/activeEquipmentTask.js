import { parseW114ExcelReport } from '@cityssm/faster-report-parser/xlsx';
import { WorkTechAPI } from '@cityssm/worktech-api';
import camelCase from 'camelcase';
import Debug from 'debug';
import { getConfigProperty } from '../../../helpers/functions.config.js';
import { downloadFilesToTemp } from '../../../helpers/functions.sftp.js';
import { moduleName } from '../helpers/moduleHelpers.js';
export const taskName = 'Active Equipment Task';
const debug = Debug(`faster-web-helper:${camelCase(moduleName)}:${camelCase(taskName)}`);
const worktech = new WorkTechAPI(getConfigProperty('worktech'));
const assetListConfig = getConfigProperty('modules.worktechUpdate.reports.w114');
export default async function runActiveEquipmentTask() {
    if (assetListConfig === undefined) {
        return;
    }
    debug(`Running "${taskName}"...`);
    const tempAssetListReportFiles = await downloadFilesToTemp(assetListConfig.ftpPath);
    /*
     * Loop through files
     */
    debug(`${tempAssetListReportFiles.length} file(s) to process...`);
    for (const reportFile of tempAssetListReportFiles) {
        try {
            const report = parseW114ExcelReport(reportFile);
            for (const fasterEquipment of report.data) {
                const worktechEquipment = await worktech.getEquipmentByEquipmentId(fasterEquipment.assetNumber);
                if (worktechEquipment === undefined) {
                    // add equipment
                }
            }
        }
        catch (error) {
            debug(error);
        }
    }
}
