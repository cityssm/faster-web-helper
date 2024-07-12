import Debug from 'debug'
import schedule from 'node-schedule'

import { getConfigProperty } from '../../../helpers/functions.config.js'
import { downloadFilesToTemp } from '../../../helpers/functions.sftp.js'

const debug = Debug('faster-web-helper:worktechUpdate')

const directChargeTransactionsConfig = getConfigProperty('modules.worktechUpdate.reports.w217')

async function downloadAndUpdateSymptoms(): Promise<void> {

  /*
   * Download files to temp
   */

  const tempDirectChargeReportFiles = await downloadFilesToTemp(directChargeTransactionsConfig.ftpPath)
}

