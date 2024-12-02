export interface UpdateScannerRecordForm {
    recordId: string;
    workOrderNumber: string;
    repairId: string;
    itemNumber: string;
    quantity: string;
    unitPrice: string;
}
export declare function updateScannerRecord(recordForm: UpdateScannerRecordForm, updateUser: FasterWebHelperSessionUser): boolean;
