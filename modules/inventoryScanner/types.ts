import type { DateString, TimeString } from "@cityssm/utils-datetime"

export type WorkOrderType = 'faster' | 'worktech'

export interface ItemValidationRecord {
  itemStoreroom: string
  itemNumberPrefix: string
  itemNumber: string
  itemDescription: string
  availableQuantity: number
  unitPrice: number

  rawJsonData?: string | null
}

export interface WorkOrderValidationRecord {
  workOrderNumber: string
  workOrderType: WorkOrderType,
  workOrderDescription: string

  technicianId?: string | null
  technicianDescription: string | null

  repairId: number | null
  repairDescription: string | null
}

export interface InventoryScannerRecord {
  recordId: number
  scannerKey: string

  scanDate: number
  scanDateString: DateString

  scanTime: number
  scanTimeString: TimeString

  workOrderNumber: string
  workOrderType: WorkOrderType,

  itemStoreroom: string | null
  itemNumberPrefix: string
  itemNumber: string
  itemDescription: string | null

  technicianId: string | null

  repairDescription: string | null
  repairId: number | null

  quantity: number
  unitPrice: number | null
  availableQuantity: number | null

  recordSync_userName: string | null
  recordSync_timeMillis: number | null
  recordSync_isSuccessful: boolean | null
  recordSync_syncedRecordId: string | null
  recordSync_message: string | null
}

export interface InventoryScannerSyncErrorLogRecord {
  recordId: number
  workOrderType: WorkOrderType

  logId: string
  
  logDate: number
  logDateString: DateString
  logTime: number
  logTimeString: TimeString

  logMessage: string

  scannerSyncedRecordId: string | null
  scannerRecordId: number | null
}