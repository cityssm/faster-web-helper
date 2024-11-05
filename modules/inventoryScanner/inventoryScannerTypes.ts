type WorkOrderType = 'faster' | 'worktech'

export interface ItemValidationRecord {
  itemStoreroom: string
  itemNumber: string
  itemDescription: string
  availableQuantity: number
  unitPrice: number
}

export interface WorkOrderValidationRecord {
  workOrderNumber: string
  workOrderType: WorkOrderType,
  workOrderDescription: string
  technicianId: string | null
  technicianDescription: string | null
  repairId: string | null
  repairDescription: string | null
}

export interface InventoryScannerRecord {
  recordId: number
  scannerKey: string
  scanDate: number
  scanDateString: string
  scanTime: number
  scanTimeString: string
  workOrderNumber: string
  workOrderType: WorkOrderType,
  itemStoreroom: string
  itemNumber: string
  technicianId: string | null
  repairId: string | null
  quantity: number
  unitPrice: number

  recordSync_userName: string | null
  recordSync_timeMillis: number | null
  recordSync_isSuccessful: boolean | null
  recordSync_syncedRecordId: string | null
  recordSync_message: string | null
}
