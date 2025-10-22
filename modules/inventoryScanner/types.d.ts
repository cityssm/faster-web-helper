import type { DateString, TimeString } from '@cityssm/utils-datetime';
export type WorkOrderType = 'faster' | 'worktech';
export interface ItemValidationRecord {
    itemStoreroom: string;
    itemNumber: string;
    itemNumberPrefix: string;
    itemDescription: string;
    availableQuantity: number;
    unitPrice: number;
    rawJsonData?: string | null;
}
export interface WorkOrderValidationRecord {
    workOrderNumber: string;
    workOrderType: WorkOrderType;
    workOrderDescription: string;
    technicianId?: string | null;
    technicianDescription: string | null;
    repairId: number | null;
    repairDescription: string | null;
    rawJsonData?: string | null;
}
export interface InventoryScannerRecord {
    recordId: number;
    scannerKey: string;
    scanDate: number;
    scanDateString: DateString;
    scanTime: number;
    scanTimeString: TimeString;
    workOrderNumber: string;
    workOrderType: WorkOrderType;
    itemStoreroom: string | null;
    itemNumber: string;
    itemNumberPrefix: string;
    itemDescription: string | null;
    technicianId: string | null;
    repairDescription: string | null;
    repairId: number | null;
    quantity: number;
    unitPrice: number | null;
    availableQuantity: number | null;
    recordSync_userName: string | null;
    recordSync_timeMillis: number | null;
    recordSync_isSuccessful: boolean | null;
    recordSync_syncedRecordId: string | null;
    recordSync_message: string | null;
    secondaryWorkOrderNumber: string | null;
    secondaryWorkOrderType: WorkOrderType | null;
    secondaryRecordSync_userName: string | null;
    secondaryRecordSync_timeMillis: number | null;
    secondaryRecordSync_isSuccessful: boolean | null;
    secondaryRecordSync_syncedRecordId: string | null;
    secondaryRecordSync_message: string | null;
}
export interface InventoryScannerSyncErrorLogRecord {
    recordId: number;
    workOrderType: WorkOrderType;
    logId: string;
    logDate: number;
    logDateString: DateString;
    logTime: number;
    logTimeString: TimeString;
    logMessage: string;
    scannerSyncedRecordId: string | null;
    scannerRecordId: number | null;
}
export interface InventoryBatch {
    batchId: number;
    openDate: number;
    openDateString: DateString;
    openTime: number;
    openTimeString: TimeString;
    closeDate: number | null;
    closeDateString: DateString | null;
    closeTime: number | null;
    closeTimeString: TimeString | null;
    recordSync_userName: string | null;
    recordSync_timeMillis: number | null;
    batchItemCount?: number;
    batchItems?: InventoryBatchItem[];
}
export interface InventoryBatchItem {
    itemStoreroom: string;
    itemNumber: string;
    itemDescription: string | null;
    countedQuantity: number | null;
    scannerKey: string | null;
    scanDate: number | null;
    scanDateString: DateString | null;
    scanTime: number | null;
    scanTimeString: TimeString | null;
}
