import { type DateString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import type { InventoryScannerRecord, WorkOrderType } from '../types.js';
export interface GetScannerRecordsFilters {
    scannerKey?: string;
    isSynced?: boolean;
    isSyncedSuccessfully?: boolean;
    isMarkedForSync?: boolean;
    syncedRecordId?: string;
    hasMissingValidation?: boolean;
    workOrderType?: WorkOrderType;
    itemNumberPrefix?: string;
    scanDateStringFrom?: DateString;
    scanDateStringTo?: DateString;
}
interface GetScannerRecordsOptions {
    limit: number;
}
export default function getScannerRecords(filters: GetScannerRecordsFilters, userOptions?: Partial<GetScannerRecordsOptions>, connectedDatabase?: sqlite.Database): InventoryScannerRecord[];
export {};
