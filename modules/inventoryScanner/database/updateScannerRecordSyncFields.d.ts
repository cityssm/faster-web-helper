export interface UpdateScannerRecordSyncFieldsForm {
    recordId: number;
    isSuccessful: boolean;
    syncedRecordId?: string;
    message?: string;
}
export declare function updateScannerRecordSyncFields(recordForm: UpdateScannerRecordSyncFieldsForm): boolean;
