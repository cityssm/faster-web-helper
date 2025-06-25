type ScannerRecordUpdateField = 'itemDescription' | 'itemStoreroom' | 'repairId' | 'unitPrice';
export declare function updateScannerRecordField(recordId: number, fieldToUpdate: ScannerRecordUpdateField, fieldValue: number | string, updateUserName: string): boolean;
export {};
