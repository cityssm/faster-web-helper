import crypto from 'node:crypto'

import type { W223StoreroomReportData } from '@cityssm/faster-api/xlsxReports.js'
import {
  type ResourceItem,
  type WorkOrderResource,
  WorkTechAPI
} from '@cityssm/worktech-api'

import { getConfigProperty } from '../../../helpers/functions.config.js'
import type { WorkOrderNumberMapping } from '../worktechUpdateTypes.js'

const worktech = new WorkTechAPI(getConfigProperty('worktech'))

function buildWorkOrderResourceItemId(
  storeroomData: W223StoreroomReportData
): string {
  return `FASTER-${storeroomData.storeroom}`.slice(0, 15)
}

export async function getOrCreateStoreroomResourceItem(
  storeroomData: W223StoreroomReportData
): Promise<ResourceItem> {
  const storeroomItemId = buildWorkOrderResourceItemId(storeroomData)

  let worktechStoreroomResourceItem =
    await worktech.getItemByItemId(storeroomItemId)

  if (worktechStoreroomResourceItem === undefined) {
    await worktech.addResourceItem({
      itemId: storeroomItemId,
      externalItemId: storeroomData.storeroom,
      itemDescription: storeroomData.storeroomDescription,
      itemClass: getConfigProperty('modules.worktechUpdate.resourceItem.itemClass'),
      itemType: getConfigProperty('modules.worktechUpdate.resourceItem.itemType'),
      stock: 0,
      quantityOnHand: 0,
      unit: getConfigProperty('modules.worktechUpdate.resourceItem.unit'),
      unitCost: 0,
    })

    worktechStoreroomResourceItem = (await worktech.getItemByItemId(
      storeroomItemId
    )) as ResourceItem
  }

  return worktechStoreroomResourceItem
}

export interface W223HashableTransactionReportData {
  documentNumber: number
  itemNumber: string
  quantity: number
  unitTrueCost: number
  createdDateTime: string
}

export function buildWorkOrderResourceDescriptionHash(
  storeroomData: W223StoreroomReportData,
  transactionData: W223HashableTransactionReportData,
  occuranceIndex: number
): string {
  const keys: string[] = [
    transactionData.documentNumber.toString(),
    storeroomData.storeroom,
    transactionData.itemNumber,
    transactionData.quantity.toString(),
    transactionData.unitTrueCost.toFixed(3),
    transactionData.createdDateTime,
    occuranceIndex.toString()
  ]

  return crypto.createHash('md5').update(keys.join('::')).digest('hex')
}

export async function getWorkOrderResources(
  workOrderNumberMapping: WorkOrderNumberMapping
): Promise<WorkOrderResource[]> {
  const unfilteredWorkOrderResources =
    await worktech.getWorkOrderResourcesByWorkOrderNumber(
      workOrderNumberMapping.workOrderNumber
    )

  return unfilteredWorkOrderResources.filter((possibleResourceRecord) => {
    return possibleResourceRecord.workDescription.startsWith(
      workOrderNumberMapping.documentNumber.toString()
    )
  })
}
