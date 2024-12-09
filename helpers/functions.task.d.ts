type scheduledTaskName = 'inventoryScanner.itemValidation.dynamicsGp' | 'inventoryScanner.workOrderValidation.fasterApi' | 'inventoryScanner.workOrderValidation.worktech';
export declare function getScheduledTaskMinutes(taskName: scheduledTaskName): number[];
export {};
