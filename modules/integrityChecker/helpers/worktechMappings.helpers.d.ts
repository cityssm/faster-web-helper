import type { AssetResult } from '@cityssm/faster-api';
import type { EquipmentItem, UpdateEquipmentFields } from '@cityssm/worktech-api';
export declare function getWorktechEquipmentId(fasterAsset: AssetResult): string;
export declare function getWorktechEquipmentClass(fasterAsset: AssetResult): string;
export declare function getWorktechEquipmentDepartment(fasterAsset: AssetResult): string;
export declare function getWorktechEquipmentDescription(fasterAsset: AssetResult): string;
export declare function getWorktechEquipmentFieldsToUpdate(fasterAsset: AssetResult, worktechEquipment: EquipmentItem): Partial<UpdateEquipmentFields>;
