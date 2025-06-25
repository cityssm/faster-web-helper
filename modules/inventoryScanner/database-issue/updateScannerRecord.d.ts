export interface UpdateScannerRecordForm {
    recordId: string;
    workOrderNumber: string;
    workOrderType?: 'faster' | 'worktech';
    repairId: string;
    itemDescription: string;
    quantity: string;
    unitPrice: string;
}
export declare function updateScannerRecord(recordForm: UpdateScannerRecordForm, updateUser: FasterWebHelperSessionUser): boolean;
