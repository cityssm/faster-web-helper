import { randomUUID } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'

import { Client } from 'basic-ftp'
import Debug from 'debug'

import type { ConfigFtpPath } from '../types/configHelperTypes.js'

import { getConfigProperty } from './functions.config.js'
import {
  doesFileExist,
  ensureTempFolderExists,
  tempFolderPath
} from './functions.filesystem.js'

const debug = Debug('faster-web-helper:functions.sftp')

export async function downloadFilesToTemp<S extends string>(
  ftpPath: ConfigFtpPath<S>
): Promise<Array<`${string}${S}`>> {
  await ensureTempFolderExists()

  const ftpClient = new Client()

  const downloadedFiles: Array<`${string}${S}`> = []

  try {
    await ftpClient.access(getConfigProperty('ftp'))

    if (ftpPath.directory !== '') {
      await ftpClient.cd(ftpPath.directory)
    }

    const filesAndDirectories = await ftpClient.list()

    for (const fileOrDirectory of filesAndDirectories) {
      if (
        fileOrDirectory.isFile &&
        fileOrDirectory.name.startsWith(ftpPath.filePrefix ?? '') &&
        fileOrDirectory.name.endsWith(ftpPath.fileSuffix ?? '')
      ) {
        // Ensure file doesn't already exist

        let localFileName = fileOrDirectory.name

        while (await doesFileExist(path.join(os.tmpdir(), localFileName))) {
          localFileName = randomUUID().slice(0, 9) + fileOrDirectory.name
        }

        const localPath = path.join(
          tempFolderPath,
          localFileName
        ) as `${string}${S}`

        debug(`Downloading ${fileOrDirectory.name} to ${localPath} ...`)

        await ftpClient.downloadTo(localPath, fileOrDirectory.name)

        downloadedFiles.push(localPath)

        if (ftpPath.doDelete ?? false) {
          await ftpClient.remove(fileOrDirectory.name)
        }
      }
    }
  } finally {
    ftpClient.close()
  }

  return downloadedFiles
}
