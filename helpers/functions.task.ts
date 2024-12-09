type scheduledTaskName =
  | 'inventoryScanner.itemValidation.dynamicsGp'
  | 'inventoryScanner.workOrderValidation.fasterApi'
  | 'inventoryScanner.workOrderValidation.worktech'

const scheduledTaskMinutes: Record<`${number}`, scheduledTaskName[]> = {
  5: ['inventoryScanner.workOrderValidation.fasterApi'],
  10: ['inventoryScanner.workOrderValidation.worktech'],
  15: ['inventoryScanner.itemValidation.dynamicsGp'],
  35: ['inventoryScanner.workOrderValidation.fasterApi'],
  40: ['inventoryScanner.workOrderValidation.worktech']
}

export function getScheduledTaskMinutes(taskName: scheduledTaskName): number[] {
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
