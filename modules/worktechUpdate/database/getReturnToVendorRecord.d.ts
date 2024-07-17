import type { ReturnToVendorRecord } from '../worktechUpdateTypes.js';
interface GetReturnToVendorRecord extends Partial<ReturnToVendorRecord> {
    storeroom: string;
    itemNumber: string;
    transactionDate: number;
    quantity: number;
    cost: number;
}
export default function getReturnToVendorRecord(returnToVendorRecord: GetReturnToVendorRecord): ReturnToVendorRecord | undefined;
export {};
