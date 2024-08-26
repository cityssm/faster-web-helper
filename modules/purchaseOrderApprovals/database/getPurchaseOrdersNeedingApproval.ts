import sqlite from 'better-sqlite3'

import type { PurchaseOrder } from '../types/recordTypes.js'

import { databasePath } from './databaseHelpers.js'
import getApprovals from './getApprovals.js'

export default function getPurchaseOrdersNeedingApproval(): PurchaseOrder[] {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const purchaseOrders = database
    .prepare(
      `select po.tenant, po.orderNumber, po.initiatingUserName, po.orderTotal, po.purchaseOrderKeyGuid,
        po.lastUpdatedDate, po.lastUpdatedTime
        from PurchaseOrders po
        left join Approvals a on po.tenant = a.tenant and po.orderNumber = a.orderNumber
        left join OutstandingApprovals oa on po.tenant = oa.tenant and po.orderNumber = oa.orderNumber
        where oa.userName is null
        group by po.tenant, po.orderNumber
        having max(a.approvalAmount) < po.orderTotal and min(a.isApproved) > 0`
    )
    .all() as PurchaseOrder[]

  for (const purchaseOrder of purchaseOrders) {
    purchaseOrder.approvals = getApprovals(
      database,
      purchaseOrder.tenant,
      purchaseOrder.orderNumber
    )
  }

  database.close()

  return purchaseOrders
}
