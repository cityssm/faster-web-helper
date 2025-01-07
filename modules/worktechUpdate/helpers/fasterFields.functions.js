export function getFasterAssetNumber(fasterAsset) {
    return fasterAsset.assetNumber;
}
export function getFasterAssetDescription(fasterAsset) {
    return `${fasterAsset.year} ${fasterAsset.make} ${fasterAsset.model} (${fasterAsset.vinSerial})`;
}
export function getFasterAssetClassCode(fasterAsset) {
    return fasterAsset.classCode;
}
export function getFasterAssetClassDescription(fasterAsset) {
    return fasterAsset.classDesc;
}
export function getFasterAssetDepartmentCode(fasterAsset) {
    return fasterAsset.departmentCode;
}
export function getFasterAssetDepartmentDescription(fasterAsset) {
    return fasterAsset.departmentDesc;
}
export function getFasterAssetKey(fasterAsset) {
    return `${fasterAsset.assetNumber} [${fasterAsset.assetShopCode}]`;
}
