import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { Client } from 'basic-ftp'
import Debug from 'debug'

import type { ConfigFtpPath } from '../types/configTypes.js'

import { getConfigProperty } from './functions.config.js'

const debug = Debug('faster-web-helper:functions.sftp')

async function doesFileExist(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}

export async function downloadFilesToTemp(
  ftpPath: ConfigFtpPath
): Promise<string[]> {
  const ftpClient = new Client()

  const downloadedFiles: string[] = []

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
        
        const localPath = path.join(os.tmpdir(), localFileName)

        debug(`Downloading ${fileOrDirectory.name} to ${localPath} ...`)

        await ftpClient.downloadTo(localPath, fileOrDirectory.name)

        downloadedFiles.push(localPath)

        if (ftpPath.doDelete ?? false) {
          debug(`DELETING FILE (COMMENTTED OUT): ${fileOrDirectory.name}`)
          // await ftpClient.remove(fileOrDirectory.name)
        }
      }
    }
  } finally {
    ftpClient.close()
  }

  return downloadedFiles
}
