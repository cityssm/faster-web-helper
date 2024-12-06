import type { InventoryScannerRecord } from '../../types.js';
export declare function updateMultipleScannerRecords(records: InventoryScannerRecord[], recordIdsToSkip: Set<number>, fields: {
    isSuccessful: boolean;
    syncedRecordId?: string;
    message?: string;
}): void;
