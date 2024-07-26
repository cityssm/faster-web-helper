import fs from 'node:fs/promises';
import { parseW114ExcelReport } from '@cityssm/faster-report-parser/xlsx';
import { dateStringToDate } from '@cityssm/utils-datetime';
import camelCase from 'camelcase';
import Debug from 'debug';
import { getConfigProperty } from '../../../helpers/functions.config.js';
import { downloadFilesToTemp } from '../../../helpers/functions.sftp.js';
import { moduleName } from '../helpers/moduleHelpers.js';
export const taskName = 'Update Asset Numbers Task';
const debug = Debug(`faster-web-helper:${camelCase(moduleName)}:${camelCase(taskName)}`);
const assetConfig = getConfigProperty('modules.autocomplete.reports.w114');
let maxAssetDateMillis = 0;
export default async function runUpdateAssetNumbersTask() {
    debug(`Running "${taskName}"...`);
    /*
     * Download files to temp
     */
    const tempAssetReportFiles = await downloadFilesToTemp(assetConfig.ftpPath);
    /*
     * Loop through the files
     */
    for (const reportFile of tempAssetReportFiles) {
        try {
            const report = parseW114ExcelReport(reportFile);
            const reportDateMillis = dateStringToDate(report.exportDate, report.exportTime).getTime();
            if (reportDateMillis < maxAssetDateMillis) {
                continue;
            }
            maxAssetDateMillis = reportDateMillis;
            const assetNumbers = [];
            for (const asset of report.data) {
                assetNumbers.push(asset.assetNumber);
            }
            await fs.writeFile('./public/autocomplete/assetNumbers.json', JSON.stringify({
                assetNumbers
            }));
        }
        catch (error) {
            debug(error);
        }
    }
    debug(`Finished "${taskName}".`);
}