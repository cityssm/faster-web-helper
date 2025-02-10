import sqlite from 'better-sqlite3';
import type { InventoryScannerSyncErrorLogRecord, WorkOrderType } from '../types.js';
export default function getLatestSyncErrorLog(workOrderType: WorkOrderType, connectedDatabase?: sqlite.Database): InventoryScannerSyncErrorLogRecord | undefined;
