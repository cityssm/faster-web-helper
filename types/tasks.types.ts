// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-secrets/no-secrets */

export type TaskName =
  | 'inventoryScanner_itemValidation_dynamicsGp'
  | 'inventoryScanner_workOrderValidation_fasterApi'
  | 'inventoryScanner_workOrderValidation_worktech'
  | 'inventoryScanner_outstandingItemRequests'
  | 'inventoryScanner_updateRecordsFromValidation'
  | 'inventoryScanner_downloadFasterMessageLog'
  | 'integrityChecker_fasterAssets'
  | 'integrityChecker_worktechEquipment'
  | 'integrityChecker_nhtsaVehicles'

export interface TaskWorkerMessage {
  destinationTaskName: TaskName | 'app'
  messageType?: string
  timeMillis: number
}
