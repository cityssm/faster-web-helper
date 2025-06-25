import type { Request, Response } from 'express';
import type { InventoryScannerRecord } from '../../types.js';
export default function handler(request: Request, response: Response<{
    pendingRecords: InventoryScannerRecord[];
}>): void;
