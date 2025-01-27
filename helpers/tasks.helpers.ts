import type { TaskName } from '../types/tasks.types.js'

const scheduledTaskMinutes: Record<`${number}`, TaskName[]> = {
  5: ['inventoryScanner.workOrderValidation.fasterApi'],
  10: ['inventoryScanner.workOrderValidation.worktech'],
  15: ['inventoryScanner.itemValidation.dynamicsGp'],
  35: ['inventoryScanner.workOrderValidation.fasterApi'],
  40: ['inventoryScanner.workOrderValidation.worktech'],
  50: ['integrityChecker.fasterAssets'],
  53: ['integrityChecker.worktechEquipment'],
  54: ['integrityChecker.nhtsaVehicles']
}

export function getScheduledTaskMinutes(taskName: TaskName): number[] {
  const scheduleMinutes: number[] = []

  for (const [minuteString, scheduledTaskNames] of Object.entries(
    scheduledTaskMinutes
  )) {
    if (scheduledTaskNames.includes(taskName)) {
      scheduleMinutes.push(Number.parseInt(minuteString))
    }
  }

  return scheduleMinutes
}
