export interface InventoryBatchItemForm {
    batchId: number | string;
    scannerKey: string;
    countedQuantity: number | string;
    itemNumber: string;
}
interface CreateOrUpdateInventoryBatchItemResult {
    success: boolean;
    batchIsOpen: boolean;
    message: string;
}
export default function createOrUpdateInventoryBatchItem(form: InventoryBatchItemForm, user?: FasterWebHelperSessionUser): CreateOrUpdateInventoryBatchItemResult;
export {};
