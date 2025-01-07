import type { AssetResult } from '@cityssm/faster-api'

export function getFasterAssetNumber(fasterAsset: AssetResult): string {
  return fasterAsset.assetNumber
}

export function getFasterAssetDescription(fasterAsset: AssetResult): string {
  return `${fasterAsset.year} ${fasterAsset.make} ${fasterAsset.model} (${fasterAsset.vinSerial})`
}

export function getFasterAssetClassCode(fasterAsset: AssetResult): string {
  return fasterAsset.classCode
}

export function getFasterAssetClassDescription(
  fasterAsset: AssetResult
): string {
  return fasterAsset.classDesc
}

export function getFasterAssetDepartmentCode(fasterAsset: AssetResult): string {
  return fasterAsset.departmentCode
}

export function getFasterAssetDepartmentDescription(
  fasterAsset: AssetResult
): string {
  return fasterAsset.departmentDesc
}

export function getFasterAssetKey(fasterAsset: AssetResult): string {
  return `${fasterAsset.assetNumber} [${fasterAsset.organization}]`
}
