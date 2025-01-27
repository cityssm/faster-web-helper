interface IntegrityRecord {
    vinSerial?: string | null;
    license?: string | null;
    year?: number | null;
    make?: string | null;
    model?: string | null;
    recordUpdate_timeMillis: number;
}
export interface IntegrityFasterAsset extends IntegrityRecord {
    assetNumber: string;
    organization: string;
    vinSerialIsValid: 0 | 1;
}
export interface IntegrityWorktechEquipment extends IntegrityRecord {
    equipmentSystemId: number | `${number}`;
    equipmentId: string;
}
export interface WorktechEquipmentIntegrityRecord extends IntegrityFasterAsset {
    worktechEquipmentSystemId: number | `${number}`;
    worktechEquipmentId: string;
    worktechVinSerial?: string | null;
    worktechLicense?: string | null;
    worktechYear?: number | null;
    worktechMake?: string | null;
    worktechModel?: string | null;
    worktechRecordUpdate_timeMillis: number;
}
export interface NhtsaVehicle {
    vin: string;
    suggestedVin: string | null;
    year?: number | null;
    make?: string;
    model?: string;
    errorCode: string;
    errorText: string;
    recordUpdate_timeMillis: number;
}
export interface FasterAssetIntegrityRecord extends IntegrityFasterAsset {
    nhtsaSuggestedVin?: string | null;
    nhtsaMake?: string | null;
    nhtsaModel?: string | null;
    nhtsaYear?: number | null;
    nhtsaErrorCode?: string;
    nhtsaErrorText?: string;
}
export {};
