import sqlite from 'better-sqlite3';
import { databasePath } from './databaseHelpers.js';
export default function getPurchaseOrder(tenant, orderNumber) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const purchaseOrder = database
        .prepare(`select tenant, orderNumber,
        orderTotal, purchaseOrderKeyGuid,
        lastUpdatedDate, lastUpdatedTime
        from PurchaseOrders
        where tenant = ?
        and orderNumber = ?`)
        .get(tenant, orderNumber);
    if (purchaseOrder !== undefined) {
        purchaseOrder.approvals = database
            .prepare(`select userName, approvalAmount, isApproved,
          lastUpdatedDate, lastUpdatedTime
          from Approvals
          where tenant = ?
          and orderNumber = ?`)
            .all(tenant, orderNumber);
    }
    database.close();
    return purchaseOrder;
}
