import type { Request, Response } from 'express';
import { type UpdateScannerRecordForm } from '../../database-issue/updateScannerRecord.js';
export default function handler(request: Request<unknown, unknown, UpdateScannerRecordForm>, response: Response): void;
