import type { GetVendorsFilters, GPItemWithQuantity, GPVendor } from '@cityssm/dynamics-gp';
import type { AssetResult } from '@cityssm/faster-api';
export type FasterAssetMappingFunction = (fasterAsset: AssetResult) => string | undefined;
type FasterAssetMappingFunctionName = 'fasterAssetToDepartment' | 'fasterAssetToEquipmentClass' | 'fasterAssetToEquipmentDescription' | 'fasterAssetToEquipmentId';
export type ConfigModuleIntegrityCheckerMappingFunctions = Partial<Record<FasterAssetMappingFunctionName, FasterAssetMappingFunction>>;
export interface ConfigIntegrityCheckerItemValidationDynamicsGPCreateInvoiceDefaults {
    vendorId: string;
    shipToLocationId: string;
    partTypeId: string;
    paymentTypeId: string;
    purchaseOrderId: string;
    purchaseOrderAccountId: string;
    taxCodeId: string;
    partCategory: string;
}
export interface ConfigIntegrityCheckerItemValidationDynamicsGP {
    source: 'dynamicsGp';
    gpLocationCodesToFasterStorerooms: Record<string, string>;
    gpItemFilter?: (item: GPItemWithQuantity) => boolean;
    updateFaster?: boolean;
    createInvoiceDefaults?: ConfigIntegrityCheckerItemValidationDynamicsGPCreateInvoiceDefaults;
}
export interface ConfigIntegrityCheckerVendorUpdateDynamicsGP {
    source: 'dynamicsGp';
    /** Filters passed to `@cityssm/dynamics-gp`, used at the time of the query */
    gpFilters?: Partial<GetVendorsFilters>;
    /** Filters run after the query, before the sync */
    gpVendorFilter?: (vendor: GPVendor) => boolean;
    /** FASTER vendor codes to ignore */
    vendorCodesToIgnore?: string[];
}
export interface ConfigModuleIntegrityChecker {
    fasterAssets?: {
        isEnabled?: boolean;
    };
    worktechEquipment?: {
        isEnabled?: boolean;
        mappingFunctions?: ConfigModuleIntegrityCheckerMappingFunctions;
    };
    nhtsaVehicles?: {
        isEnabled?: boolean;
    };
    fasterItems?: {
        isEnabled?: boolean;
        storerooms?: string[];
        validation?: ConfigIntegrityCheckerItemValidationDynamicsGP;
    };
    fasterVendors?: {
        isEnabled?: boolean;
        update?: ConfigIntegrityCheckerVendorUpdateDynamicsGP;
    };
}
export {};
