import sqlite from 'better-sqlite3'

import type {
  PurchaseOrder,
  PurchaseOrderApproval
} from '../types/recordTypes.js'

import { databasePath } from './databaseHelpers.js'

export default function getPurchaseOrder(
  tenant: string,
  orderNumber: string | number
): PurchaseOrder | undefined {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const purchaseOrder = database
    .prepare(
      `select tenant, orderNumber,
        orderTotal, purchaseOrderKeyGuid,
        lastUpdatedDate, lastUpdatedTime
        from PurchaseOrders
        where tenant = ?
        and orderNumber = ?`
    )
    .get(tenant, orderNumber) as PurchaseOrder | undefined

  if (purchaseOrder !== undefined) {
    purchaseOrder.approvals = database
      .prepare(
        `select userName, approvalAmount, isApproved,
          lastUpdatedDate, lastUpdatedTime
          from Approvals
          where tenant = ?
          and orderNumber = ?`
      )
      .all(tenant, orderNumber) as PurchaseOrderApproval[]
  }

  database.close()

  return purchaseOrder
}
