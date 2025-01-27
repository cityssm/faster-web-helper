export type TaskName = 'inventoryScanner.itemValidation.dynamicsGp' | 'inventoryScanner.workOrderValidation.fasterApi' | 'inventoryScanner.workOrderValidation.worktech' | 'inventoryScanner.outstandingItemRequests' | 'inventoryScanner.updateRecordsFromValidation' | 'integrityChecker.fasterAssets' | 'integrityChecker.worktechEquipment';
export interface TaskWorkerMessage {
    destinationTaskName: TaskName | 'app';
    messageType?: string;
    timeMillis: number;
}
