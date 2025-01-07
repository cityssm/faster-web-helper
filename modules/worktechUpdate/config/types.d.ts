import type { AssetResult } from '@cityssm/faster-api';
export type FasterAssetMappingFunction = (fasterAsset: AssetResult) => string | undefined;
type FasterAssetMappingFunctionName = 'fasterAssetToEquipmentId' | 'fasterAssetToEquipmentClass' | 'fasterAssetToEquipmentDescription' | 'fasterAssetToDepartment';
export type ConfigModuleWorktechUpdateMappingFunctions = Partial<Record<FasterAssetMappingFunctionName, FasterAssetMappingFunction>>;
export interface ConfigModuleWorktechUpdate {
    activeEquipment?: {
        isEnabled?: boolean;
        mappingFunctions?: ConfigModuleWorktechUpdateMappingFunctions;
    };
}
export {};
