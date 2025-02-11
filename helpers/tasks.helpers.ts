// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-secrets/no-secrets */

import { minutesToMillis } from '@cityssm/to-millis'

import type { TaskName } from '../types/tasks.types.js'

const scheduledTaskMinutes: Record<`${number}`, TaskName[]> = {
  5: ['inventoryScanner_workOrderValidation_fasterApi'],
  10: ['inventoryScanner_workOrderValidation_worktech'],
  15: ['inventoryScanner_itemValidation_dynamicsGp'],
  35: ['inventoryScanner_workOrderValidation_fasterApi'],
  40: ['inventoryScanner_workOrderValidation_worktech'],
  50: ['integrityChecker_fasterAssets'],
  53: ['integrityChecker_worktechEquipment'],
  54: ['integrityChecker_nhtsaVehicles']
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

export function getMinimumMillisBetweenRuns(taskName: TaskName): number {
  const minutes = getScheduledTaskMinutes(taskName)

  if (minutes.length === 0) {
    return 0
  }

  const scheduledRunsPerHour = minutes.length
  const allowedRunsPerHour = scheduledRunsPerHour * 2

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  return Math.floor(minutesToMillis(Math.max(60 / allowedRunsPerHour - 5, 0)))
}
