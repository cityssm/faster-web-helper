import type { InventoryScannerRecord, WorkOrderType } from '../../types.js';
export declare function updateMultipleScannerRecords(records: InventoryScannerRecord[], recordIdsToSkip: Set<number>, fields: {
    workOrderType: WorkOrderType;
    isSuccessful: boolean;
    syncedRecordId?: string;
    message?: string;
}): void;
