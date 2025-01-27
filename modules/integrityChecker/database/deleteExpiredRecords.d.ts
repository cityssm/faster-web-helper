import type sqlite from 'better-sqlite3';
type RecordTable = 'FasterAssets' | 'WorktechEquipment';
export declare function deleteExpiredRecords(recordTable: RecordTable, recordUpdateTimeMillis: number, connectedDatabase: sqlite.Database): number;
export {};
