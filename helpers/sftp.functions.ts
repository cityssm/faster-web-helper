import { randomUUID } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'

import { Client } from 'basic-ftp'
import Debug from 'debug'

import type { ConfigFtpPath } from '../types/configHelperTypes.js'

import { getConfigProperty } from './config.functions.js'
import {
  doesFileExist,
  ensureTempFolderExists,
  tempFolderPath
} from './filesystem.functions.js'

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

export async function uploadFile(
  targetFtpFolderPath: string,
  localFilePath: string
): Promise<boolean> {
  const ftpConfig = getConfigProperty('ftp')

  const ftpClient = new Client()

  const localFileName = localFilePath.split(path.sep).at(-1) ?? 'upload.txt'

  try {
    await ftpClient.access(ftpConfig)

    debug(`Connected to ${ftpConfig?.host}`)

    if (targetFtpFolderPath !== '') {
      await ftpClient.cd(targetFtpFolderPath)
    }

    await ftpClient.uploadFrom(localFilePath, localFileName)
  } finally {
    ftpClient.close()
  }

  return true
}