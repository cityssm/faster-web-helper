import type { InventoryScannerRecord, WorkOrderType } from '../types.js';
export declare function getWorkOrderTypeFromWorkOrderNumber(workOrderNumber: string): WorkOrderType;
export declare function sortScannerRecordsByWorkOrderType(records: InventoryScannerRecord[]): Partial<Record<WorkOrderType, InventoryScannerRecord[]>>;
