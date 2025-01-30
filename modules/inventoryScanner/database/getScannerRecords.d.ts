import type { InventoryScannerRecord, WorkOrderType } from '../types.js';
interface GetScannerRecordsFilters {
    scannerKey?: string;
    isSynced?: boolean;
    isSyncedSuccessfully?: boolean;
    isMarkedForSync?: boolean;
    hasMissingValidation?: boolean;
    workOrderType?: WorkOrderType;
    itemNumberPrefix?: string;
}
interface GetScannerRecordsOptions {
    limit: number;
}
export default function getScannerRecords(filters: GetScannerRecordsFilters, userOptions?: Partial<GetScannerRecordsOptions>): InventoryScannerRecord[];
export {};
