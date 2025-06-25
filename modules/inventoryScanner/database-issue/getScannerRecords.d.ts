import sqlite from 'better-sqlite3';
import type { InventoryScannerRecord, WorkOrderType } from '../types.js';
interface GetScannerRecordsFilters {
    scannerKey?: string;
    isSynced?: boolean;
    isSyncedSuccessfully?: boolean;
    isMarkedForSync?: boolean;
    syncedRecordId?: string;
    hasMissingValidation?: boolean;
    workOrderType?: WorkOrderType;
    itemNumberPrefix?: string;
}
interface GetScannerRecordsOptions {
    limit: number;
}
export default function getScannerRecords(filters: GetScannerRecordsFilters, userOptions?: Partial<GetScannerRecordsOptions>, connectedDatabase?: sqlite.Database): InventoryScannerRecord[];
export {};
