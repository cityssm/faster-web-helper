import sqlite from 'better-sqlite3';
import type { WorkOrderType } from '../types.js';
interface CreateSyncErrorLogRecord {
    workOrderType: WorkOrderType;
    logId: string;
    logDate: Date;
    logMessage: string;
    scannerSyncedRecordId?: string;
    scannerRecordId?: number;
    recordCreate_userName: string;
}
export default function createSyncErrorLogRecord(syncLogError: CreateSyncErrorLogRecord, connectedDatabase?: sqlite.Database): void;
export {};
