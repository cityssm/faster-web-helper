type scheduledTaskName = 'inventoryScanner.itemValidation.dynamicsGp' | 'inventoryScanner.workOrderValidation.fasterApi' | 'inventoryScanner.workOrderValidation.worktech' | 'worktechUpdate.activeEquipment';
export declare function getScheduledTaskMinutes(taskName: scheduledTaskName): number[];
export {};
