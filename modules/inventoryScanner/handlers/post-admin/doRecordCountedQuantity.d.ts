import type { Request, Response } from 'express';
import { type InventoryBatchItemForm } from '../../database/createOrUpdateInventoryBatchItem.js';
export default function handler(request: Request<unknown, unknown, InventoryBatchItemForm>, response: Response): void;
