import type { Request, Response } from 'express'

import getInventoryBatch from '../../database-count/getInventoryBatch.js'
import { countBatchToCSV } from '../../helpers/countExport.helpers.js'

export default function handler(
  request: Request<{ batchId: string }>,
  response: Response
): void {
  const batchId = request.params.batchId

  const batch = getInventoryBatch(batchId, {
    itemsToInclude: 'counted'
  })

  if (batch === undefined) {
    response.status(404).json({
      success: false,
      message: `Batch with ID ${batchId} not found.`
    })

    return
  }

  if (batch.recordSync_timeMillis === null) {
    response.status(400).json({
      success: false,
      message: `Batch with ID ${batchId} has not been synced.`
    })
    return
  }

  if (batch.batchItems === undefined || batch.batchItems.length === 0) {
    response.status(400).json({
      success: false,
      message: `Batch with ID ${batchId} has no counted items.`
    })
    return
  }

  const csv = countBatchToCSV(batch)

  response.setHeader('Content-Type', 'text/csv')
  response.setHeader(
    'Content-Disposition',
    `attachment; filename="countBatch-${batchId}.csv"`
  )

  response.status(200).send(csv)
}
