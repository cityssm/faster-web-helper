export type TaskName = 'inventoryScanner.itemValidation.dynamicsGp' | 'inventoryScanner.workOrderValidation.fasterApi' | 'inventoryScanner.workOrderValidation.worktech' | 'inventoryScanner.outstandingItemRequests' | 'inventoryScanner.updateRecordsFromValidation' | 'worktechUpdate.activeEquipment';
export interface TaskWorkerMessage {
    destinationTaskName: TaskName | 'app';
    messageType?: string;
    timeMillis: number;
}
