interface DynamicsGpInventoryItemToUpdate {
    itemNumber: string;
    storeroom: string;
    fasterItemName: string | null;
    fasterBinLocation: string | null;
    fasterQuantityInStock: number | null;
    gpItemName: string | null;
    gpBinLocation: string | null;
    gpAlternateLocation: string | null;
    gpCurrentCost: number | null;
    gpQuantityInStock: number | null;
}
export default function getDynamicsGpInventoryItemsToUpdateInFaster(): DynamicsGpInventoryItemToUpdate[];
export {};
