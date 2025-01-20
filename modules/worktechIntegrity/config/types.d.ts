import type { AssetResult } from '@cityssm/faster-api';
export type FasterAssetMappingFunction = (fasterAsset: AssetResult) => string | undefined;
type FasterAssetMappingFunctionName = 'fasterAssetToEquipmentId' | 'fasterAssetToEquipmentClass' | 'fasterAssetToEquipmentDescription' | 'fasterAssetToDepartment';
export type ConfigModuleWorktechIntegrityMappingFunctions = Partial<Record<FasterAssetMappingFunctionName, FasterAssetMappingFunction>>;
export interface ConfigModuleWorktechIntegrity {
    equipment?: {
        isEnabled?: boolean;
        mappingFunctions?: ConfigModuleWorktechIntegrityMappingFunctions;
    };
}
export {};
