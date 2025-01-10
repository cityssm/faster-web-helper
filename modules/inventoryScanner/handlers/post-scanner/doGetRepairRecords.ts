import type { Request, Response } from 'express'

import type { TaskWorkerMessage } from '../../../../types/tasks.types.js'
import getWorkOrderValidationRecords from '../../database/getWorkOrderValidationRecords.js'
import { getWorkOrderTypeFromWorkOrderNumber } from '../../helpers/workOrders.functions.js'

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
        ? 'inventoryScanner.workOrderValidation.worktech'
        : 'inventoryScanner.workOrderValidation.fasterApi'

    const workerMessage: TaskWorkerMessage = {
      destinationTaskName,
      messageType: `workOrderValidation ${ request.body.workOrderNumber}`,
      timeMillis: Date.now()
    }

    if (process.send !== undefined) {
      process.send(workerMessage)
    }
  }

  response.json({ records })
}
