import type { InventoryBatch } from '../types.js';
export declare function getInventoryBatch(batchId: number): InventoryBatch | undefined;
export declare function getOpenedInventoryBatch(includeBatchItems?: boolean, createIfNotExists?: boolean, user?: FasterWebHelperSessionUser): InventoryBatch | undefined;
