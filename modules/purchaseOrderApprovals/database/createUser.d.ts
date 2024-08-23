import type { PurchaseOrderApprovalUser } from '../types/recordTypes.js';
export default function createUser(user: Partial<PurchaseOrderApprovalUser> & {
    userName: string;
}): boolean;
