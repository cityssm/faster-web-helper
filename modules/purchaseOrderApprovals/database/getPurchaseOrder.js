import sqlite from 'better-sqlite3';
import { databasePath } from './databaseHelpers.js';
import getApprovals from './getApprovals.js';
export default function getPurchaseOrder(tenant, orderNumber) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const purchaseOrder = database
        .prepare(`select tenant, orderNumber,
        initiatingUserName,
        orderTotal, purchaseOrderKeyGuid,
        lastUpdatedDate, lastUpdatedTime
        from PurchaseOrders
        where tenant = ?
        and orderNumber = ?`)
        .get(tenant, orderNumber);
    if (purchaseOrder !== undefined) {
        purchaseOrder.approvals = getApprovals(database, tenant, orderNumber);
    }
    database.close();
    return purchaseOrder;
}
