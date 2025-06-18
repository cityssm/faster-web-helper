import type { Request, Response } from 'express';
import type { InventoryBatch } from '../../types.js';
export default function handler(request: Request, response: Response<{
    inventoryBatches: InventoryBatch[];
}>): void;
