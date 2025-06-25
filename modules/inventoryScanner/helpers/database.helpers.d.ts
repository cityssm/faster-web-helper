export type SettingName = 'itemRequests.count' | 'itemRequests.maxItemRequestId' | 'syncScannerRecords.isRunning';
export declare const databasePath = "data/inventoryScanner.db";
export declare function initializeInventoryScannerDatabase(): boolean;
