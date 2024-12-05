// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-magic-numbers, unicorn/no-array-push-push */

import fs from 'node:fs/promises'
import path from 'node:path'

import { dateIntegerToDate } from '@cityssm/utils-datetime'

import { getConfigProperty } from '../../../../helpers/functions.config.js'
import {
  ensureTempFolderExists,
  tempFolderPath
} from '../../../../helpers/functions.filesystem.js'
import { uploadFile } from '../../../../helpers/functions.sftp.js'
import { hasFasterApi } from '../../../../helpers/helpers.faster.js'
import { updateScannerRecordSyncFields } from '../../database/updateScannerRecordSyncFields.js'
import type { InventoryScannerRecord } from '../../types.js'

function recordToExportDataLine(record: InventoryScannerRecord): string {
  // A - "RDC"
  const dataPieces = ['RDC']

  // B - Ignored
  dataPieces.push('')

  // C - Storeroom
  dataPieces.push(record.itemStoreroom ?? '')

  // D - Technician ID
  dataPieces.push(record.technicianId ?? '')

  // E - Invoice Number
  dataPieces.push(record.recordId.toString().padStart(14, 'X'))

  // F - Invoice Date
  const scanDate = dateIntegerToDate(record.scanDate) as Date

  const fasterInvoiceDate =
    (scanDate.getMonth() + 1).toString().padStart(2, '0') +
    '/' +
    scanDate.getDate().toString().padStart(2, '0') +
    '/' +
    scanDate.getFullYear().toString().padStart(4, '0')

  dataPieces.push(fasterInvoiceDate)

  // G - Invoice Amount
  dataPieces.push(
    record.unitPrice === null
      ? ''
      : (record.quantity * record.unitPrice).toFixed(4)
  )

  // H - Ignored
  dataPieces.push('')

  // I - Quantity
  dataPieces.push(record.quantity.toString())

  // J - Ignored
  dataPieces.push('')

  // K - Unit Price
  dataPieces.push(record.unitPrice === null ? '' : record.unitPrice.toFixed(4))

  // L - Line Abbreviation
  dataPieces.push('IIU')

  // M - Item Number
  dataPieces.push(record.itemNumber)

  // N - Description
  let itemDescription = (record.itemDescription ?? record.itemNumber).slice(
    0,
    40
  )

  if (itemDescription.includes(',')) {
    itemDescription =
      '"' + itemDescription.replaceAll('"', String.raw`\"`) + '"'
  }

  dataPieces.push(itemDescription)

  // O - Ignored
  dataPieces.push('')

  // P - Ignored
  dataPieces.push('')

  // Q - Repair ID
  dataPieces.push(record.repairId === null ? '' : record.repairId.toString())

  // R - Work Order Number
  dataPieces.push(record.workOrderNumber)

  return dataPieces.join(',')
}

function getExportFileName(): string {
  const rightNow = new Date()

  const timezone = (rightNow.getTimezoneOffset() / 60) * 100

  const timezoneString =
    timezone > 0
      ? '-' + timezone.toString().padStart(4, '0')
      : '+' + Math.abs(timezone).toString().padStart(4, '0')

  const dateString =
    rightNow.getFullYear().toString() +
    '-' +
    (rightNow.getMonth() + 1).toString().padStart(2, '0') +
    '-' + 
    rightNow.getDate().toString().padStart(2, '0') +
    '_' +
    rightNow.getHours().toString().padStart(2, '0') +
    rightNow.getMinutes().toString().padStart(2, '0') +
    rightNow.getSeconds().toString().padStart(2, '0') +
    timezoneString

  const fileName =
    // eslint-disable-next-line no-secrets/no-secrets
    getConfigProperty('modules.inventoryScanner.exportFileNamePrefix') +
    dateString +
    '.csv'

  return fileName
}

function updateMultipleScannerRecords(
  records: InventoryScannerRecord[],
  recordIdsToSkip: Set<number>,
  fields: {
    isSuccessful: boolean
    syncedRecordId?: string
    message?: string
  }
): void {
  for (const record of records) {
    if (recordIdsToSkip.has(record.recordId)) {
      continue
    }

    updateScannerRecordSyncFields({
      recordId: record.recordId,
      isSuccessful: fields.isSuccessful,
      syncedRecordId: fields.syncedRecordId,
      message: fields.message
    })
  }
}

export async function syncScannerRecordsWithFaster(
  records: InventoryScannerRecord[]
): Promise<void> {
  /*
   * Build file data
   */

  const exportFileDataLines: string[] = []
  const errorRecordIds = new Set<number>()

  for (const record of records) {
    try {
      exportFileDataLines.push(recordToExportDataLine(record))
    } catch (error) {
      errorRecordIds.add(record.recordId)

      updateScannerRecordSyncFields({
        recordId: record.recordId,
        isSuccessful: false,
        message: (error as Error).message
      })
    }
  }

  const exportFileData = exportFileDataLines.join('\n')

  /*
   * Write file
   */

  const exportFileName = getExportFileName()

  await ensureTempFolderExists()

  const exportFilePath = path.join(tempFolderPath, exportFileName)

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(exportFilePath, exportFileData)
  } catch {
    updateMultipleScannerRecords(records, errorRecordIds, {
      isSuccessful: false,
      message: `Error writing file to temp folder: ${exportFilePath}`
    })

    return
  }

  /*
   * Upload file
   */

  const targetFtpPath = getConfigProperty('modules.inventoryScanner.ftpPath')

  try {
    await uploadFile(targetFtpPath, exportFilePath)
  } catch {
    updateMultipleScannerRecords(records, errorRecordIds, {
      isSuccessful: false,
      message: `Error uploading file to FTP path: ${targetFtpPath}`
    })

    return
  }

  /*
   * Ping IIU
   */

  const integrationId = getConfigProperty(
    'modules.inventoryScanner.integrationId'
  )

  if (hasFasterApi && integrationId !== undefined) {
    const fasterApiImport = await import('@cityssm/faster-api')

    const fasterApiConfig = getConfigProperty('fasterWeb')

    const fasterApi = new fasterApiImport.FasterApi(
      fasterApiConfig.tenantOrBaseUrl,
      fasterApiConfig.apiUserName ?? '',
      fasterApiConfig.apiPassword ?? ''
    )

    await fasterApi.createIntegrationLogMessage({
      integrationId,
      integrationLogLevel: 'Information',
      integrationLogMessageType: 'Summary',
      message: 'File uploaded to FTP.',
      transactionData: JSON.stringify(
        {
          ftpHost: getConfigProperty('ftp')?.host,
          folderPath: targetFtpPath,
          fileName: exportFileName,
          recordCount: exportFileDataLines.length
        },
        undefined,
        2
      )
    })
  }

  updateMultipleScannerRecords(records, errorRecordIds, {
    isSuccessful: true,
    message: `File successfully uploaded: ${exportFileName}`
  })
}
