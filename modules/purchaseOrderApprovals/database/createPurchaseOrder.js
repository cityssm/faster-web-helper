import { dateToInteger, dateToTimeInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { getKeyGuid } from '../helpers/moduleHelpers.js';
import { databasePath } from './databaseHelpers.js';
export default function createPurchaseOrder(form, user) {
    const database = sqlite(databasePath);
    const rightNow = new Date();
    const lastUpdatedDate = dateToInteger(rightNow);
    const lastUpdatedTime = dateToTimeInteger(rightNow);
    const keyGuid = getKeyGuid();
    database
        .prepare(`insert into PurchaseOrders
        (tenant, orderNumber, initiatingUserName, orderTotal,
          lastUpdatedDate, lastUpdatedTime, purchaseOrderKeyGuid)
        values (?, ?, ?, ?, ?, ?, ?)`)
        .run(form.tenant, form.orderNumber, user.userName, form.orderTotal, lastUpdatedDate, lastUpdatedTime, keyGuid);
    const approvalAmount = Math.min(user.approvalMax, Number.parseFloat(form.orderTotal));
    database
        .prepare(`insert into Approvals
        (tenant, orderNumber, userName, approvalAmount, isApproved,
          lastUpdatedDate, lastUpdatedTime)
        values (?, ?, ?, ?, ?, ?, ?)`)
        .run(form.tenant, form.orderNumber, user.userName, approvalAmount, 1, lastUpdatedDate, lastUpdatedTime);
    database.close();
    return keyGuid;
}
