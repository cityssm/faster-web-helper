import type { InventoryScannerRecord } from '../types.js';
interface GetScannerRecordsFilters {
    scannerKey?: string;
}
interface GetScannerRecordsOptions {
    limit: number;
}
export default function getScannerRecords(filters: GetScannerRecordsFilters, userOptions?: Partial<GetScannerRecordsOptions>): InventoryScannerRecord[];
export {};
