export type TaskName = 'inventoryScanner_itemValidation_dynamicsGp' | 'inventoryScanner_workOrderValidation_fasterApi' | 'inventoryScanner_workOrderValidation_worktech' | 'inventoryScanner_outstandingItemRequests' | 'inventoryScanner_updateRecordsFromValidation' | 'inventoryScanner_downloadFasterMessageLog' | 'integrityChecker_fasterAssets' | 'integrityChecker_worktechEquipment' | 'integrityChecker_nhtsaVehicles' | 'integrityChecker_fasterInventory';
export interface TaskWorkerMessage {
    destinationTaskName: TaskName | 'app';
    messageType?: string;
    timeMillis: number;
}
