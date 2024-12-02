type ScannerRecordUpdateField = 'repairId' | 'itemStoreroom' | 'unitPrice';
export declare function updateScannerRecordField(recordId: number, fieldToUpdate: ScannerRecordUpdateField, fieldValue: string | number, updateUserName: string): boolean;
export {};
