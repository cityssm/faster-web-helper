import fs from 'node:fs/promises'

import {
  type W217DocumentReportData,
  type W217ExcelReportResults,
  parseW217ExcelReport
} from '@cityssm/faster-report-parser/xlsx'
import {
  dateStringToInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'
import { WorkTechAPI } from '@cityssm/worktech-api'
import camelCase from 'camelcase'
import Debug from 'debug'

import { getConfigProperty } from '../../../helpers/functions.config.js'
import { downloadFilesToTemp } from '../../../helpers/functions.sftp.js'
import addReturnToVendorRecord from '../database/addReturnToVendorRecord.js'
import addWorkOrderNumberMapping from '../database/addWorkOrderNumberMapping.js'
import getReturnToVendorRecord from '../database/getReturnToVendorRecord.js'
import getWorkOrderNumberMapping from '../database/getWorkOrderNumberMapping.js'
import updateWorkOrderNumberMapping from '../database/updateWorkOrderNumberMapping.js'
import { moduleName } from '../helpers/moduleHelpers.js'
import type { ReturnToVendorRecord } from '../worktechUpdateTypes.js'

export const taskName = 'Direct Change Helper Task'

const debug = Debug(`faster-web-helper:${camelCase(moduleName)}:${camelCase(taskName)}`)

const worktech = new WorkTechAPI(getConfigProperty('worktech'))

const directChargeTransactionsConfig = getConfigProperty(
  'modules.worktechUpdate.reports.w217'
)

async function _updateWorkOrderNumberMappings(
  report: W217ExcelReportResults,
  data: W217DocumentReportData
): Promise<boolean> {
  const mapping = getWorkOrderNumberMapping(data.documentNumber)

  const exportDate = dateStringToInteger(report.exportDate)

  const exportTime = timeStringToInteger(report.exportTime)

  if (mapping === undefined) {
    /*
     * Unseen Mapping
     * Save it
     */

    debug(`New Mapping: ${data.documentNumber} -> ${data.symptom}`)

    addWorkOrderNumberMapping({
      documentNumber: data.documentNumber,
      workOrderNumber: data.symptom,
      exportDate,
      exportTime
    })
  } else if (
    mapping.exportDate < exportDate ||
    (mapping.exportDate === exportDate && mapping.exportTime < exportTime)
  ) {
    /*
     * This record is newer.
     */

    if (mapping.workOrderNumber !== data.symptom) {
      /*
       * Work order number change.
       * Update any previous records for the document number.
       */

      debug(
        `Work Order Number Update: ${data.documentNumber} -> ${data.symptom}`
      )

      const oldResourceRecords =
        await worktech.getWorkOrderResourcesByWorkOrderNumber(
          mapping.workOrderNumber
        )

      if (data.symptom === '') {
        for (const oldResourceRecord of oldResourceRecords) {
          await worktech.deleteWorkOrderResource(
            oldResourceRecord.serviceRequestItemSystemId
          )
        }
      } else {
        const newWorkOrder = await worktech.getWorkOrderByWorkOrderNumber(
          data.symptom
        )

        if (newWorkOrder === undefined) {
          debug(`New work order number not found: ${data.symptom}`)
          return false
        }

        for (const oldResourceRecord of oldResourceRecords) {
          await worktech.updateWorkOrderResource({
            serviceRequestItemSystemId:
              oldResourceRecord.serviceRequestItemSystemId,
            serviceRequestSystemId: newWorkOrder?.serviceRequestSystemId,
            workOrderNumber: newWorkOrder?.workOrderNumber
          })
        }
      }
    }

    /*
     * Update mapping record
     */

    updateWorkOrderNumberMapping({
      documentNumber: mapping.documentNumber,
      workOrderNumber: data.symptom,
      exportDate,
      exportTime
    })
  }

  return true
}

function _trackReturnToVendorRecords(
  report: W217ExcelReportResults,
  data: W217DocumentReportData
): void {
  for (const transaction of data.transactions) {
    if (transaction.repairDescription.startsWith('Return to Vendor - ')) {
      const transactionRecord: ReturnToVendorRecord = {
        documentNumber: data.documentNumber,
        storeroom: transaction.storeroom,
        itemNumber: transaction.itemNumber,
        transactionDate: dateStringToInteger(transaction.transactionDate),
        quantity: transaction.quantity,
        cost: transaction.cost
      }

      const existingRecord = getReturnToVendorRecord(transactionRecord)

      if (existingRecord === undefined) {
        debug(
          `New "Return to Vendor" record: ${JSON.stringify(transactionRecord)}`
        )
        addReturnToVendorRecord(transactionRecord)
      }
    }
  }
}

/**
 * - Maintains mappings between Faster document numbers and Worktech work order numbers.
 * - Tracks "Return to Vendor" transactions.
 */
export default async function runDirectChargeHelperTask(): Promise<void> {
  debug(`Running "${taskName}"...`)

  /*
   * Download files to temp
   */

  const tempDirectChargeReportFiles = await downloadFilesToTemp(
    directChargeTransactionsConfig.ftpPath
  )

  /*
   * Loop through files
   */

  debug(`${tempDirectChargeReportFiles.length} file(s) to process...`)

  for (const reportFile of tempDirectChargeReportFiles) {
    try {
      const report = parseW217ExcelReport(reportFile)

      if ((report.parameters['Include Returns'] ?? '') !== 'Yes') {
        debug(
          'W217 reports must have "Include Returns" = "Yes", skipping file.'
        )
        continue
      }

      for (const data of report.data) {
        await _updateWorkOrderNumberMappings(report, data)
        _trackReturnToVendorRecords(report, data)
      }

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.unlink(reportFile)
    } catch (error) {
      debug(error)
    }
  }

  debug(`Finished "${taskName}".`)
}
