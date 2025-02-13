export function createOrUpdateDynamicsGpInventoryItem(gpInventoryItem, connectedDatabase) {
    const sql = `insert or replace into DynamicsGpInventoryItems (
      itemNumber, locationCode, fasterStoreroom,
      itemDescription,
      itemShortName,
      itemType,
      binNumber,
      currentCost,
      quantityOnHand,
      recordUpdate_timeMillis
    ) 
    values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const statement = connectedDatabase.prepare(sql);
    const success = statement.run(gpInventoryItem.itemNumber, gpInventoryItem.locationCode, gpInventoryItem.fasterStoreroom, gpInventoryItem.itemDescription, gpInventoryItem.itemShortName, gpInventoryItem.itemType, gpInventoryItem.binNumber, gpInventoryItem.currentCost, gpInventoryItem.quantityOnHand, gpInventoryItem.recordUpdate_timeMillis);
    return success.changes > 0;
}
