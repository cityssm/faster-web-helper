import type {
  FasterApiResponse,
  FasterApiResponseWithCollectionResult,
  ItemRequestResult
} from '@cityssm/faster-api'

import getMaxWorkOrderValidationRepairId from '../database/getMaxWorkOrderValidationRecordRepairId.js'
import getUnsyncedWorkOrderNumbersAndRepairIds from '../database/getUnsyncedWorkOrderNumbersAndRepairIds.js'
import getWorkOrderValidationRepairIds from '../database/getWorkOrderValidationRepairIds.js'

const lookAheadRepairIdCount = 100

export function getRepairIdsToRefresh(): number[] {
  /*
   * Include any repair ids for unsent scanner records
   */

  const unsyncedNumbers = getUnsyncedWorkOrderNumbersAndRepairIds('faster')

  const repairIdSet = new Set<number>(unsyncedNumbers.repairIds.values())

  if (unsyncedNumbers.workOrderNumbers.length > 0) {
    const correspondingRepairIds = getWorkOrderValidationRepairIds(
      unsyncedNumbers.workOrderNumbers,
      'faster'
    )

    for (const possibleRepairId of correspondingRepairIds) {
      repairIdSet.add(possibleRepairId.repairId)
    }
  }

  /*
   * Add look ahead repair ids
   */

  const maxRepairId = getMaxWorkOrderValidationRepairId('faster')

  for (
    let repairId = maxRepairId + 1;
    repairId <= maxRepairId + lookAheadRepairIdCount;
    repairId += 1
  ) {
    repairIdSet.add(repairId)
  }

  /*
   * Return set as array
   */

  return [...repairIdSet.values()]
}

interface SummarizedItemRequests {
  itemRequestsCount: number
  maxItemRequestId: number
}

export function summarizeItemRequests(
  itemRequestsResponse: FasterApiResponse<
    FasterApiResponseWithCollectionResult<ItemRequestResult>
  >
): SummarizedItemRequests {
  let itemRequestsCount = 0
  let maxItemRequestId = 0

  if (itemRequestsResponse.success) {
    for (const itemRequest of itemRequestsResponse.response.results) {
      itemRequestsCount += 1
      if (itemRequest.itemRequestID > maxItemRequestId) {
        maxItemRequestId = itemRequest.itemRequestID
      }
    }
  }

  return {
    itemRequestsCount,
    maxItemRequestId
  }
}
