import type { Request, Response } from 'express';
interface DoDeleteScannerRecordForm {
    recordId: string;
    scannerKey: string;
}
export default function handler(request: Request<unknown, unknown, DoDeleteScannerRecordForm>, response: Response): void;
export {};
