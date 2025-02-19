import fasterInventoryItemConstants from '@cityssm/faster-constants/inventory/items'
import sqlite from 'better-sqlite3'

import { databasePath } from './helpers.database.js'

interface DynamicsGpInventoryItemToUpdate {
  itemNumber: string
  storeroom: string

  fasterItemName: string | null
  fasterBinLocation: string | null
  fasterQuantityInStock: number | null

  gpItemName: string | null
  gpBinLocation: string | null
  gpAlternateLocation: string | null
  gpCurrentCost: number | null
  gpQuantityInStock: number | null
}

export default function getDynamicsGpInventoryItemsToUpdateInFaster(): DynamicsGpInventoryItemToUpdate[] {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const result = database
    .prepare(
      `select
        ifnull(f.itemNumber, gp.itemNumber) as itemNumber,
        ifnull(f.storeroom, gp.fasterStoreroom) as storeroom,

        f.itemName as fasterItemName,
        case when f.binLocation = 'Undefined' then '' else f.binLocation end as fasterBinLocation,
        f.quantityInStock as fasterQuantityInStock,

        gp.itemDescription as gpItemName,
        gp.binNumber as gpBinLocation,
        gp.itemShortName as gpAlternateLocation,
        gp.currentCost as gpCurrentCost,
        gp.quantityOnHand as gpQuantityInStock

        from FasterInventoryItems f
        full join DynamicsGpInventoryItems gp
          on f.itemNumber = gp.itemNumber and f.storeroom = gp.fasterStoreroom
          
        where (f.itemNumber is null and gp.quantityOnHand > 0)
          or gp.itemNumber is null
          or f.itemName <> substring(gp.itemDescription, 1, ${fasterInventoryItemConstants.itemName.maxLength})
          or case when f.binLocation = 'Undefined' then '' else f.binLocation end <> substr(gp.binNumber, 1, ${fasterInventoryItemConstants.binLocation.maxLength})
          
        order by gpItemName desc`
    )
    .all() as DynamicsGpInventoryItemToUpdate[]

  database.close()

  return result
}
