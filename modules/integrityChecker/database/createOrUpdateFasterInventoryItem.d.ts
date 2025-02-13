import type sqlite from 'better-sqlite3';
import type { IntegrityFasterInventoryItem } from '../types.js';
export declare function createOrUpdateFasterInventoryItem(fasterInventoryItem: IntegrityFasterInventoryItem, connectedDatabase: sqlite.Database): boolean;
