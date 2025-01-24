import { type DateString, type TimeString } from '@cityssm/utils-datetime';
import type { WorkOrderType } from '../types.js';
export type CreateScannerRecordForm = {
    scannerKey: string;
    scannerDateString?: DateString;
    scannerTimeString?: TimeString;
    workOrderNumber: string;
    workOrderType?: WorkOrderType;
    technicianId?: string;
    repairId: string;
    itemStoreroom?: string;
    itemDescription?: string;
    quantity: number | string;
    quantityMultiplier: '1' | '-1' | 1 | -1;
    unitPrice?: number | string;
} & ({
    itemType: 'stock';
    itemNumber: string;
} | {
    itemType: 'nonStock';
    itemNumberPrefix: string;
    itemNumberSuffix: string;
});
export default function createOrUpdateScannerRecord(scannerRecord: CreateScannerRecordForm): boolean;
