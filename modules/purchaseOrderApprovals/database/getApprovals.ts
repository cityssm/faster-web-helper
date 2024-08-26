import type sqlite from 'better-sqlite3'

import type { PurchaseOrderApproval } from '../types/recordTypes.js'

export default function getApprovals(
  database: sqlite.Database,
  tenant: string,
  orderNumber: string | number
): PurchaseOrderApproval[] {
  return database
    .prepare(
      `select userName, approvalAmount, isApproved,
        lastUpdatedDate, lastUpdatedTime
        from Approvals
        where tenant = ?
        and orderNumber = ?`
    )
    .all(tenant, orderNumber) as PurchaseOrderApproval[]
}
