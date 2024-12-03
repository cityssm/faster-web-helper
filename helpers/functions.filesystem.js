import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
export const tempFolderPath = path.join(os.tmpdir(), 'fasterWebHelper');
export async function doesFileExist(filePath) {
    try {
        await fs.access(filePath, fs.constants.F_OK);
        return true;
    }
    catch {
        return false;
    }
}
export async function ensureTempFolderExists() {
    if (!(await doesFileExist(tempFolderPath))) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.mkdir(tempFolderPath);
    }
}
