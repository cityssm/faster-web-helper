export interface WorkOrderNumberMapping {
  documentNumber: number
  workOrderNumber: string
  exportDate: number
  exportTime: number
}

export interface ReturnToVendorRecord {
  documentNumber: number
  storeroom: string
  itemNumber: string
  transactionDate: number
  quantity: number
  cost: number
}