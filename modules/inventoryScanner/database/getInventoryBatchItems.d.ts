import sqlite from 'better-sqlite3';
import type { InventoryBatchItem } from '../types.js';
export declare function getInventoryBatchItems(batchId: number | string, connectedDatabase?: sqlite.Database): InventoryBatchItem[];
