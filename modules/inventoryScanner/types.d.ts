import type { DateString, TimeString } from "@cityssm/utils-datetime";
export type WorkOrderType = 'faster' | 'worktech';
export interface ItemValidationRecord {
    itemStoreroom: string;
    itemNumberPrefix: string;
    itemNumber: string;
    itemDescription: string;
    availableQuantity: number;
    unitPrice: number;
}
export interface WorkOrderValidationRecord {
    workOrderNumber: string;
    workOrderType: WorkOrderType;
    workOrderDescription: string;
    technicianId?: string | null;
    technicianDescription: string | null;
    repairId: number | null;
    repairDescription: string | null;
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
    itemNumberPrefix: string;
    itemNumber: string;
    itemDescription: string | null;
    technicianId: string | null;
    repairId: number | null;
    repairDescription: string | null;
    quantity: number;
    unitPrice: number | null;
    recordSync_userName: string | null;
    recordSync_timeMillis: number | null;
    recordSync_isSuccessful: boolean | null;
    recordSync_syncedRecordId: string | null;
    recordSync_message: string | null;
}
