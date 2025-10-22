import sqlite from 'better-sqlite3';
import type { WorkOrderType } from '../types.js';
export interface UpdateScannerRecordSyncFieldsForm {
    recordId: number;
    workOrderType: WorkOrderType;
    isSuccessful: boolean;
    syncedRecordId?: string;
    message?: string;
}
export declare function updateScannerRecordSyncFields(recordForm: UpdateScannerRecordSyncFieldsForm, connectedDatabase?: sqlite.Database): boolean;
