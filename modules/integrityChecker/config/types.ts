import type { AssetResult } from '@cityssm/faster-api'

export type FasterAssetMappingFunction = (
  fasterAsset: AssetResult
) => string | undefined

type FasterAssetMappingFunctionName =
  | 'fasterAssetToEquipmentId'
  | 'fasterAssetToEquipmentClass'
  | 'fasterAssetToEquipmentDescription'
  | 'fasterAssetToDepartment'

export type ConfigModuleIntegrityCheckerMappingFunctions = Partial<
  Record<FasterAssetMappingFunctionName, FasterAssetMappingFunction>
>

export interface ConfigModuleIntegrityChecker {
  fasterAssets?: {
    isEnabled?: boolean
  }
  worktechEquipment?: {
    isEnabled?: boolean
    mappingFunctions?: ConfigModuleIntegrityCheckerMappingFunctions
  }
}
