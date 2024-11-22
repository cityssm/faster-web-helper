import { type DateString, type TimeString } from '@cityssm/utils-datetime';
import type { WorkOrderType } from '../types.js';
export interface CreateScannerRecordForm {
    scannerKey: string;
    scannerDateString?: DateString;
    scannerTimeString?: TimeString;
    workOrderNumber: string;
    workOrderType?: WorkOrderType;
    technicianId?: string;
    repairId?: string;
    itemStoreroom?: string;
    itemNumber: string;
    quantity: number | string;
    unitPrice?: number | string;
}
export default function createScannerRecord(scannerRecord: CreateScannerRecordForm): boolean;
