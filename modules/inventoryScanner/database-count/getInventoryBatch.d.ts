import type { InventoryBatch } from '../types.js';
import { type GetInventoryBatchItemsFilters } from './getInventoryBatchItems.js';
export default function getInventoryBatch(batchId: number | string, batchItemFilters?: GetInventoryBatchItemsFilters): InventoryBatch | undefined;
export declare function getOpenedInventoryBatch(includeBatchItems?: boolean, createIfNotExists?: boolean, user?: FasterWebHelperSessionUser): InventoryBatch | undefined;
