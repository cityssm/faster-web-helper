export function createOrUpdateFasterAsset(fasterAsset, connectedDatabase) {
    const sql = `insert or replace into FasterAssets (
      assetNumber, organization,
      vinSerial, vinSerialIsValid,
      license,
      year, make, model,
      recordUpdate_timeMillis
    ) 
    values (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const statement = connectedDatabase.prepare(sql);
    const success = statement.run(fasterAsset.assetNumber, fasterAsset.organization, fasterAsset.vinSerial, fasterAsset.vinSerialIsValid, fasterAsset.license, fasterAsset.year, fasterAsset.make, fasterAsset.model, fasterAsset.recordUpdate_timeMillis);
    return success.changes > 0;
}
