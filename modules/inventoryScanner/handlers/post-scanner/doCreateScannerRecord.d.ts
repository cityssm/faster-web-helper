import type { Request, Response } from 'express';
interface DoCreateScannerRecordForm {
    scannerKey: string;
    workOrderNumber: string;
    repairId: string;
    itemNumber: string;
    quantity: string;
}
export default function handler(request: Request<unknown, unknown, DoCreateScannerRecordForm>, response: Response): void;
export {};
