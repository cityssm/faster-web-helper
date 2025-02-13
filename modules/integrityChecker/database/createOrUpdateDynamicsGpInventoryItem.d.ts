import type sqlite from 'better-sqlite3';
import type { IntegrityDynamicsGpInventoryItem } from '../types.js';
export declare function createOrUpdateDynamicsGpInventoryItem(gpInventoryItem: IntegrityDynamicsGpInventoryItem, connectedDatabase: sqlite.Database): boolean;
