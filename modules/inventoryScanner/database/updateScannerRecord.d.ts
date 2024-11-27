type ScannerRecordUpdateField = 'repairId' | 'itemStoreroom' | 'unitPrice';
export declare function updateScannerRecord(recordId: number, fieldToUpdate: ScannerRecordUpdateField, fieldValue: string | number, updateUserName: string): boolean;
export {};
