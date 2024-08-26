import type sqlite from 'better-sqlite3';
import type { PurchaseOrderApproval } from '../types/recordTypes.js';
export default function getApprovals(database: sqlite.Database, tenant: string, orderNumber: string | number): PurchaseOrderApproval[];
