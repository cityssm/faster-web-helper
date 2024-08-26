export interface PurchaseOrder {
  tenant: string
  orderNumber: number
  orderTotal: number
  initiatingUserName: string
  purchaseOrderKeyGuid: string
  lastUpdatedDate: number
  lastUpdatedTime: number
  approvals: PurchaseOrderApproval[]
}

export interface PurchaseOrderApproval {
  tenant?: string
  orderNumber?: string
  userName: string
  approvalAmount: number
  isApproved: boolean
  lastUpdatedDate: number
  lastUpdatedTime: number
}

export interface PurchaseOrderApprovalUser
  extends PurchaseOrderApprovalSessionUser {
  fasterWebUserName?: string
  emailAddress?: string
  parentUserName?: string
  backupUserName?: string
}

declare global {
  export interface PurchaseOrderApprovalSessionUser {
    userName: string
    approvalMax: number
    isAdmin: boolean
    userKeyGuid: string
  }
}

declare module 'express-session' {
  interface Session {
    purchaseOrderApprovalUser?: PurchaseOrderApprovalSessionUser
  }
}
