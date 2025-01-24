type ScannerRecordUpdateField = 'repairId' | 'itemStoreroom' | 'itemDescription' | 'unitPrice';
export declare function updateScannerRecordField(recordId: number, fieldToUpdate: ScannerRecordUpdateField, fieldValue: string | number, updateUserName: string): boolean;
export {};
