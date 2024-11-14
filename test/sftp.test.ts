import assert from 'node:assert'
import fs from 'node:fs/promises'
import { describe, it } from 'node:test'

import { getConfigProperty } from '../helpers/functions.config.js'
import { downloadFilesToTemp } from '../helpers/functions.sftp.js'

await describe('functions.sftp', async () => {
  await it('Downloads files to temp', async () => {
    const tempFiles = await downloadFilesToTemp({
      ...getConfigProperty('modules.inventoryScanner.reports.w200')!.ftpPath,
      doDelete: false // don't purge anything while testing
    })

    assert(tempFiles.length > 0)

    for (const tempFile of tempFiles) {
      try {
        await fs.access(tempFile, fs.constants.F_OK)
      } catch {
        assert.fail(`File does not exist: ${tempFile}`)
      }

      try {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.unlink(tempFile)
      } catch {
        assert.fail(`Error cleaning up: ${tempFile}`)
      }
    }
  })
})
