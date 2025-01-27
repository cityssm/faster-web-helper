export interface IntegrityFasterAsset extends IntegrityRecord {
    assetNumber: string;
    organization: string;
    vinSerialIsValid: 0 | 1;
}
export interface IntegrityWorktechEquipment extends IntegrityRecord {
    equipmentSystemId: number | `${number}`;
    equipmentId: string;
}
interface IntegrityRecord {
    vinSerial?: string | null;
    license?: string | null;
    year?: number | null;
    make?: string | null;
    model?: string | null;
    recordUpdate_timeMillis: number;
}
export interface AssetIntegrityRecord extends IntegrityFasterAsset {
    worktechEquipmentSystemId: number | `${number}`;
    worktechEquipmentId: string;
    worktechVinSerial?: string | null;
    worktechLicense?: string | null;
    worktechYear?: number | null;
    worktechMake?: string | null;
    worktechModel?: string | null;
    worktechRecordUpdate_timeMillis: number;
}
export {};
