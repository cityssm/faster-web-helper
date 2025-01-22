import type { AssetResult } from '@cityssm/faster-api'
import type { EquipmentItem, UpdateEquipmentFields } from '@cityssm/worktech-api'

import { getConfigProperty } from '../../../helpers/config.helpers.js'

import {
  getFasterAssetClassCode,
  getFasterAssetDepartmentDescription,
  getFasterAssetDescription,
  getFasterAssetNumber
} from './fasterFields.helpers.js'

const mappingFunctions = getConfigProperty(
  // eslint-disable-next-line no-secrets/no-secrets
  'modules.worktechIntegrity.equipment.mappingFunctions'
)

export function getWorktechEquipmentId(fasterAsset: AssetResult): string {
  if (mappingFunctions.fasterAssetToEquipmentId !== undefined) {
    return (
      mappingFunctions.fasterAssetToEquipmentId(fasterAsset) ??
      getFasterAssetNumber(fasterAsset)
    )
  }

  return getFasterAssetNumber(fasterAsset)
}

export function getWorktechEquipmentClass(fasterAsset: AssetResult): string {
  if (mappingFunctions.fasterAssetToEquipmentClass !== undefined) {
    return (
      mappingFunctions.fasterAssetToEquipmentClass(fasterAsset) ??
      getFasterAssetClassCode(fasterAsset)
    )
  }

  return getFasterAssetClassCode(fasterAsset)
}

export function getWorktechEquipmentDepartment(
  fasterAsset: AssetResult
): string {
  if (mappingFunctions.fasterAssetToDepartment !== undefined) {
    return (
      mappingFunctions.fasterAssetToDepartment(fasterAsset) ??
      getFasterAssetDepartmentDescription(fasterAsset)
    )
  }

  return getFasterAssetDepartmentDescription(fasterAsset)
}

export function getWorktechEquipmentDescription(
  fasterAsset: AssetResult
): string {
  if (mappingFunctions.fasterAssetToEquipmentDescription !== undefined) {
    return (
      mappingFunctions.fasterAssetToEquipmentDescription(fasterAsset) ??
      getFasterAssetDescription(fasterAsset)
    )
  }

  return getFasterAssetDescription(fasterAsset)
}

export function getWorktechEquipmentFieldsToUpdate(fasterAsset: AssetResult, worktechEquipment: EquipmentItem): Partial<UpdateEquipmentFields> {

  const fieldsToUpdate: Partial<UpdateEquipmentFields> = {}

  const equipmentDescription = getWorktechEquipmentDescription(fasterAsset)
  if (equipmentDescription !== worktechEquipment.equipmentDescription) {
    fieldsToUpdate.equipmentDescription = equipmentDescription
  }

  

  return fieldsToUpdate

}