import type { Request, Response } from 'express';
type DoCreateScannerRecordForm = {
    scannerKey: string;
    workOrderNumber: string;
    repairId: string;
    quantity: string;
    quantityMultiplier: '-1' | '1';
} & ({
    itemType: 'nonStock';
    itemNumberPrefix: string;
    itemNumberSuffix: string;
    itemDescription: string;
    unitPrice: string;
} | {
    itemType: 'stock';
    itemNumber: string;
});
export default function handler(request: Request<unknown, unknown, DoCreateScannerRecordForm>, response: Response): void;
export {};
