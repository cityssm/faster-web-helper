import type { GPItemWithQuantity } from '@cityssm/dynamics-gp';
import type { AssetResult } from '@cityssm/faster-api';
export type FasterAssetMappingFunction = (fasterAsset: AssetResult) => string | undefined;
type FasterAssetMappingFunctionName = 'fasterAssetToEquipmentId' | 'fasterAssetToEquipmentClass' | 'fasterAssetToEquipmentDescription' | 'fasterAssetToDepartment';
export type ConfigModuleIntegrityCheckerMappingFunctions = Partial<Record<FasterAssetMappingFunctionName, FasterAssetMappingFunction>>;
export interface ConfigItemValidationDynamicsGP {
    source: 'dynamicsGP';
    gpLocationCodesToFasterStorerooms: Record<string, string>;
    gpItemFilter?: (item: GPItemWithQuantity) => boolean;
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
    fasterInventory?: {
        isEnabled?: boolean;
        validation?: ConfigItemValidationDynamicsGP;
    };
}
export {};
