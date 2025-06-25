import type { Request, Response } from 'express';
interface DoGetScannerRecordsForm {
    scannerKey: string;
}
export default function handler(request: Request<unknown, unknown, DoGetScannerRecordsForm>, response: Response): void;
export {};
