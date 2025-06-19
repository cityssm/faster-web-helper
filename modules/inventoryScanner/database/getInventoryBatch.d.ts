import type { InventoryBatch } from '../types.js';
export default function getInventoryBatch(batchId: number | string): InventoryBatch | undefined;
export declare function getOpenedInventoryBatch(includeBatchItems?: boolean, createIfNotExists?: boolean, user?: FasterWebHelperSessionUser): InventoryBatch | undefined;
