export interface PurchaseOrder {
    tenant: string;
    orderNumber: number;
    orderTotal: number;
    purchaseOrderKeyGuid: string;
    lastUpdatedDate: number;
    lastUpdatedTime: number;
    approvals: PurchaseOrderApproval[];
}
export interface PurchaseOrderApproval {
    tenant?: string;
    orderNumber?: string;
    userName: string;
    approvalAmount: number;
    isApproved: boolean;
    lastUpdatedDate: number;
    lastUpdatedTime: number;
}
export interface PurchaseOrderApprovalUser extends PurchaseOrderApprovalSessionUser {
    fasterWebUserName?: string;
    emailAddress?: string;
    approvalMax: number;
    parentUserName?: string;
    backupUserName?: string;
}
declare global {
    export interface PurchaseOrderApprovalSessionUser {
        userName: string;
        isAdmin: boolean;
        userKeyGuid: string;
    }
}
declare module 'express-session' {
    interface Session {
        purchaseOrderApprovalUser?: PurchaseOrderApprovalSessionUser;
    }
}
