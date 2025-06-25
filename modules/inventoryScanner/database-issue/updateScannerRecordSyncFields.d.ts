import sqlite from 'better-sqlite3';
export interface UpdateScannerRecordSyncFieldsForm {
    recordId: number;
    isSuccessful: boolean;
    syncedRecordId?: string;
    message?: string;
}
export declare function updateScannerRecordSyncFields(recordForm: UpdateScannerRecordSyncFieldsForm, connectedDatabase?: sqlite.Database): boolean;
