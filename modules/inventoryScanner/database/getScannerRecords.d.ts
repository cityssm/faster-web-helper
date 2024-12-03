import type { InventoryScannerRecord } from '../types.js';
interface GetScannerRecordsFilters {
    scannerKey?: string;
    isSynced?: boolean;
    isMarkedForSync?: boolean;
    hasMissingValidation?: boolean;
}
interface GetScannerRecordsOptions {
    limit: number;
}
export default function getScannerRecords(filters: GetScannerRecordsFilters, userOptions?: Partial<GetScannerRecordsOptions>): InventoryScannerRecord[];
export {};
