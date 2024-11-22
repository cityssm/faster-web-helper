import type { Request, Response } from 'express'

import getWorkOrderValidationRecords from '../../database/getWorkOrderValidationRecords.js'
import { getWorkOrderTypeFromWorkOrderNumber } from '../../helpers/workOrders.js'

interface DoGetRepairIdsForm {
  workOrderNumber: string
}

export default function handler(request: Request<unknown, unknown, DoGetRepairIdsForm>, response: Response): void {
  const workOrderType = getWorkOrderTypeFromWorkOrderNumber(request.body.workOrderNumber)

  const records = getWorkOrderValidationRecords(request.body.workOrderNumber, workOrderType)

  response.json({ records })
}
