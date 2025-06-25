import sqlite from 'better-sqlite3';
import type { InventoryBatchItem } from '../types.js';
export interface GetInventoryBatchItemsFilters {
    itemNumberFilter?: string;
    itemNumberFilterType?: 'contains' | 'endsWith' | 'startsWith';
    itemsToInclude?: 'all' | 'counted' | 'uncounted';
}
export declare function getInventoryBatchItems(batchId: number | string, filters?: GetInventoryBatchItemsFilters, connectedDatabase?: sqlite.Database): InventoryBatchItem[];
