import type sqlite from 'better-sqlite3';
import type { IntegrityFasterAsset } from '../types.js';
export declare function createOrUpdateFasterAsset(fasterAsset: IntegrityFasterAsset, connectedDatabase: sqlite.Database): boolean;
