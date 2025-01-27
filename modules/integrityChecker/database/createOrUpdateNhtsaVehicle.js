export default function createOrUpdateNhtsaVehicle(nhtsaVehicle, connectedDatabase) {
    const sql = `insert or replace into NhtsaVehicles (
      vin, suggestedVin,
      make, model, year,
      errorCode, errorText,
      recordUpdate_timeMillis
    ) 
    values (?, ?, ?, ?, ?, ?, ?, ?)`;
    const statement = connectedDatabase.prepare(sql);
    const success = statement.run(nhtsaVehicle.vin, nhtsaVehicle.suggestedVin, nhtsaVehicle.make, nhtsaVehicle.model, nhtsaVehicle.year, nhtsaVehicle.errorCode, nhtsaVehicle.errorText, nhtsaVehicle.recordUpdate_timeMillis);
    return success.changes > 0;
}
