import type { InventoryScannerRecord } from '../../types.js';
export declare function formatRecordIdAsInvoiceNumber(recordId: number): string;
export declare function syncScannerRecordsWithFaster(records: InventoryScannerRecord[]): Promise<void>;
