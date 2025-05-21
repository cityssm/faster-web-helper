// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-secrets/no-secrets */

export type TaskName =
  | 'integrityChecker_fasterAssets'
  | 'integrityChecker_fasterInventory'
  | 'integrityChecker_fasterVendors'
  | 'integrityChecker_nhtsaVehicles'
  | 'integrityChecker_worktechEquipment'
  | 'inventoryScanner_downloadFasterMessageLog'
  | 'inventoryScanner_itemValidation_dynamicsGp'
  | 'inventoryScanner_outstandingItemRequests'
  | 'inventoryScanner_updateRecordsFromValidation'
  | 'inventoryScanner_workOrderValidation_fasterApi'
  | 'inventoryScanner_workOrderValidation_worktech'

export interface TaskWorkerMessage {
  destinationTaskName: 'app' | TaskName
  messageType?: string
  timeMillis: number
}
