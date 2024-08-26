interface CreatePurchaseOrderForm {
    tenant: string;
    orderNumber: string;
    orderTotal: string;
}
export default function createPurchaseOrder(form: CreatePurchaseOrderForm, user: PurchaseOrderApprovalSessionUser): string;
export {};
