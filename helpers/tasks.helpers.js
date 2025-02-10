import { minutesToMillis } from '@cityssm/to-millis';
const scheduledTaskMinutes = {
    5: ['inventoryScanner.workOrderValidation.fasterApi'],
    10: ['inventoryScanner.workOrderValidation.worktech'],
    15: ['inventoryScanner.itemValidation.dynamicsGp'],
    35: ['inventoryScanner.workOrderValidation.fasterApi'],
    40: ['inventoryScanner.workOrderValidation.worktech'],
    50: ['integrityChecker.fasterAssets'],
    53: ['integrityChecker.worktechEquipment'],
    54: ['integrityChecker.nhtsaVehicles']
};
export function getScheduledTaskMinutes(taskName) {
    const scheduleMinutes = [];
    for (const [minuteString, scheduledTaskNames] of Object.entries(scheduledTaskMinutes)) {
        if (scheduledTaskNames.includes(taskName)) {
            scheduleMinutes.push(Number.parseInt(minuteString));
        }
    }
    return scheduleMinutes;
}
export function getMinimumMillisBetweenRuns(taskName) {
    const minutes = getScheduledTaskMinutes(taskName);
    if (minutes.length === 0) {
        return 0;
    }
    const scheduledRunsPerHour = minutes.length;
    const allowedRunsPerHour = scheduledRunsPerHour * 2;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    return Math.floor(minutesToMillis(Math.max(60 / allowedRunsPerHour - 5, 0)));
}
