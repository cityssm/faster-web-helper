import type { Request, Response } from 'express';
import type { GetInventoryBatchItemsFilters } from '../../database-count/getInventoryBatchItems.js';
export default function handler(request: Request<unknown, unknown, GetInventoryBatchItemsFilters & {
    batchId: number | string;
}>, response: Response): void;
