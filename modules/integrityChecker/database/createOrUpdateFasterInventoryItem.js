export function createOrUpdateFasterInventoryItem(fasterInventoryItem, connectedDatabase) {
    const sql = `insert or replace into FasterInventoryItems (
      itemNumber, storeroom,
      itemName,
      binLocation,
      averageTrueCost,
      quantityInStock,
      recordUpdate_timeMillis
    ) 
    values (?, ?, ?, ?, ?, ?, ?)`;
    const statement = connectedDatabase.prepare(sql);
    const success = statement.run(fasterInventoryItem.itemNumber, fasterInventoryItem.storeroom, fasterInventoryItem.itemName, fasterInventoryItem.binLocation, fasterInventoryItem.averageTrueCost, fasterInventoryItem.quantityInStock, fasterInventoryItem.recordUpdate_timeMillis);
    return success.changes > 0;
}
