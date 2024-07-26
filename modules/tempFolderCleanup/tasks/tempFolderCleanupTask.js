// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable security/detect-non-literal-fs-filename */
import fs from 'node:fs/promises';
import path from 'node:path';
import camelCase from 'camelcase';
import Debug from 'debug';
import { getConfigProperty } from '../../../helpers/functions.config.js';
import { ensureTempFolderExists, tempFolderPath } from '../../../helpers/functions.sftp.js';
import { moduleName } from '../helpers/moduleHelpers.js';
export const taskName = 'Cleanup Database Task';
const debug = Debug(`faster-web-helper:${camelCase(moduleName)}:${camelCase(taskName)}`);
export default async function runTempFolderCleanupTask() {
    await ensureTempFolderExists();
    const maxAgeMillis = Date.now() -
        getConfigProperty('modules.tempFolderCleanup.maxAgeDays') * 86_400 * 1000;
    const fileNames = await fs.readdir(tempFolderPath);
    for (const fileName of fileNames) {
        const fullFilePath = path.join(tempFolderPath, fileName);
        const fileStats = await fs.stat(fullFilePath);
        if (fileStats.mtimeMs <= maxAgeMillis) {
            debug(`Deleting temp file: ${fileName}`);
            await fs.unlink(fullFilePath);
        }
    }
}
