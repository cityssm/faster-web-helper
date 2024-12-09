import type { InventoryScannerRecord, WorkOrderType } from '../types.js';
interface GetScannerRecordsFilters {
    scannerKey?: string;
    isSynced?: boolean;
    isMarkedForSync?: boolean;
    hasMissingValidation?: boolean;
    workOrderType?: WorkOrderType;
}
interface GetScannerRecordsOptions {
    limit: number;
}
export default function getScannerRecords(filters: GetScannerRecordsFilters, userOptions?: Partial<GetScannerRecordsOptions>): InventoryScannerRecord[];
export {};
