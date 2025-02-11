import type { Request, Response } from 'express'

import type { TaskWorkerMessage } from '../../../../types/tasks.types.js'
import getWorkOrderValidationRecords from '../../database/getWorkOrderValidationRecords.js'
import { getWorkOrderTypeFromWorkOrderNumber } from '../../helpers/workOrders.helpers.js'

interface DoGetRepairIdsForm {
  workOrderNumber: string
}

export default function handler(
  request: Request<unknown, unknown, DoGetRepairIdsForm>,
  response: Response
): void {
  const workOrderType = getWorkOrderTypeFromWorkOrderNumber(
    request.body.workOrderNumber
  )

  const records = getWorkOrderValidationRecords(
    request.body.workOrderNumber,
    workOrderType
  )

  if (records.length === 0) {
    const destinationTaskName =
      workOrderType === 'worktech'
        ? 'inventoryScanner_workOrderValidation_worktech'
        : 'inventoryScanner_workOrderValidation_fasterApi' // eslint-disable-line no-secrets/no-secrets

    const workerMessage: TaskWorkerMessage = {
      destinationTaskName,
      messageType: request.body.workOrderNumber,
      timeMillis: Date.now()
    }

    if (process.send !== undefined) {
      process.send(workerMessage)
    }
  }

  response.json({ records })
}
