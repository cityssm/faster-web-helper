import fs from 'node:fs/promises';
import { parseW200ExcelReport } from '@cityssm/faster-report-parser/xlsx';
import { dateStringToDate } from '@cityssm/utils-datetime';
import camelCase from 'camelcase';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../../../debug.config.js';
import { getConfigProperty } from '../../../helpers/config.helpers.js';
import { downloadFilesToTemp } from '../../../helpers/sftp.helpers.js';
import { moduleName } from '../helpers/moduleHelpers.js';
export const taskName = 'Update Item Numbers Task';
const debug = Debug(`${DEBUG_NAMESPACE}:${camelCase(moduleName)}:${camelCase(taskName)}`);
const inventoryConfig = getConfigProperty('modules.autocomplete.reports.w200');
let maxInventoryDateMillis = 0;
export default async function runUpdateItemNumbersTask() {
    debug(`Running "${taskName}"...`);
    /*
     * Download files to temp
     */
    const tempInventoryReportFiles = await downloadFilesToTemp(inventoryConfig.ftpPath);
    /*
     * Loop through the files
     */
    for (const reportFile of tempInventoryReportFiles) {
        try {
            const report = parseW200ExcelReport(reportFile);
            const reportDateMillis = dateStringToDate(report.exportDate, report.exportTime).getTime();
            if (reportDateMillis < maxInventoryDateMillis) {
                continue;
            }
            maxInventoryDateMillis = reportDateMillis;
            const itemNumbers = [];
            for (const storeroom of report.data) {
                for (const item of storeroom.items) {
                    itemNumbers.push(item.itemNumber);
                }
            }
            await fs.writeFile('./public/autocomplete/itemNumbers.json', JSON.stringify({
                itemNumbers
            }));
        }
        catch (error) {
            debug(error);
        }
    }
    debug(`Finished "${taskName}".`);
}
