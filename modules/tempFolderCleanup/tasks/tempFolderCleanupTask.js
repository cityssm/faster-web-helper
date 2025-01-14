// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable security/detect-non-literal-fs-filename */
import fs from 'node:fs/promises';
import path from 'node:path';
import { daysToMillis } from '@cityssm/to-millis';
import camelCase from 'camelcase';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../../../debug.config.js';
import { getConfigProperty } from '../../../helpers/config.helpers.js';
import { ensureTempFolderExists, tempFolderPath } from '../../../helpers/filesystem.helpers.js';
import { moduleName } from '../helpers/moduleHelpers.js';
export const taskName = 'Cleanup Database Task';
const debug = Debug(`${DEBUG_NAMESPACE}:${camelCase(moduleName)}:${camelCase(taskName)}`);
export default async function runTempFolderCleanupTask() {
    await ensureTempFolderExists();
    const maxAgeMillis = Date.now() -
        daysToMillis(getConfigProperty('modules.tempFolderCleanup.maxAgeDays'));
    const fileNames = await fs.readdir(tempFolderPath);
    for (const fileName of fileNames) {
        const fullFilePath = path.join(tempFolderPath, fileName);
        const fileStats = await fs.stat(fullFilePath);
        if (fileStats.mtimeMs <= maxAgeMillis) {
            debug(`Deleting temp file: ${fileName}`);
            try {
                await fs.unlink(fullFilePath);
            }
            catch {
                debug(`Error deleting temp file: ${fileName}`);
            }
        }
    }
}
