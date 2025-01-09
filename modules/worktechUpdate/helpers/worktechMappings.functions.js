import { getConfigProperty } from '../../../helpers/config.functions.js';
import { getFasterAssetClassCode, getFasterAssetDepartmentDescription, getFasterAssetDescription, getFasterAssetNumber } from './fasterFields.functions.js';
const mappingFunctions = getConfigProperty(
// eslint-disable-next-line no-secrets/no-secrets
'modules.worktechUpdate.activeEquipment.mappingFunctions');
export function getWorktechEquipmentId(fasterAsset) {
    if (mappingFunctions.fasterAssetToEquipmentId !== undefined) {
        return (mappingFunctions.fasterAssetToEquipmentId(fasterAsset) ??
            getFasterAssetNumber(fasterAsset));
    }
    return getFasterAssetNumber(fasterAsset);
}
export function getWorktechEquipmentClass(fasterAsset) {
    if (mappingFunctions.fasterAssetToEquipmentClass !== undefined) {
        return (mappingFunctions.fasterAssetToEquipmentClass(fasterAsset) ??
            getFasterAssetClassCode(fasterAsset));
    }
    return getFasterAssetClassCode(fasterAsset);
}
export function getWorktechEquipmentDepartment(fasterAsset) {
    if (mappingFunctions.fasterAssetToDepartment !== undefined) {
        return (mappingFunctions.fasterAssetToDepartment(fasterAsset) ??
            getFasterAssetDepartmentDescription(fasterAsset));
    }
    return getFasterAssetDepartmentDescription(fasterAsset);
}
export function getWorktechEquipmentDescription(fasterAsset) {
    if (mappingFunctions.fasterAssetToEquipmentDescription !== undefined) {
        return (mappingFunctions.fasterAssetToEquipmentDescription(fasterAsset) ??
            getFasterAssetDescription(fasterAsset));
    }
    return getFasterAssetDescription(fasterAsset);
}
export function getWorktechEquipmentFieldsToUpdate(fasterAsset, worktechEquipment) {
    const fieldsToUpdate = {};
    const equipmentDescription = getWorktechEquipmentDescription(fasterAsset);
    if (equipmentDescription !== worktechEquipment.equipmentDescription) {
        fieldsToUpdate.equipmentDescription = equipmentDescription;
    }
    return fieldsToUpdate;
}
