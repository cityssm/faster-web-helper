import { dateIntegerToString, timeIntegerToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/database.helpers.js';
export function getInventoryBatchItems(batchId, filters = {}, connectedDatabase) {
    const database = connectedDatabase ??
        sqlite(databasePath, {
            readonly: true
        });
    let whereClause = '';
    const parameters = [batchId];
    if ((filters.itemNumberFilter ?? '') !== '') {
        const itemNumberFilter = (filters.itemNumberFilter ?? '').trim();
        if (itemNumberFilter.length > 0) {
            switch (filters.itemNumberFilterType ?? 'contains') {
                case 'contains': {
                    whereClause = "where i.itemNumber like '%' || ? || '%'";
                    parameters.push(itemNumberFilter);
                    break;
                }
                case 'endsWith': {
                    whereClause = "where i.itemNumber like '%' || ?";
                    parameters.push(itemNumberFilter);
                    break;
                }
                case 'startsWith': {
                    whereClause = "where i.itemNumber like ? || '%'";
                    parameters.push(itemNumberFilter);
                    break;
                }
            }
        }
    }
    let havingClause = '';
    switch (filters.itemsToInclude ?? 'counted') {
        case 'all': {
            // No filter
            break;
        }
        case 'counted': {
            havingClause = 'having max(i.countedQuantity) is not null';
            break;
        }
        case 'uncounted': {
            havingClause = 'having max(i.countedQuantity) is null';
            break;
        }
    }
    const result = database
        .function('userFunction_dateIntegerToString', dateIntegerToString)
        .function('userFunction_timeIntegerToString', timeIntegerToString)
        .prepare(`select itemStoreroom, itemNumber,
        max(itemDescription) as itemDescription,
        max(countedQuantity) as countedQuantity,
        max(scannerKey) as scannerKey,
        max(scanDate) as scanDate,
        max(scanDateString) as scanDateString,
        max(scanTime) as scanTime,
        max(scanTimeString) as scanTimeString

        from (		
          select v.itemStoreroom, v.itemNumber, v.itemDescription,
          null as countedQuantity,
          null as scannerKey,
          null as scanDate,
          null as scanDateString,
          null as scanTime,
          null as scanTimeString
          from ItemValidationRecords v
          where v.recordDelete_timeMillis is null
        
          union
          
          select i.itemStoreroom, i.itemNumber, null as itemDescription,
          i.countedQuantity,
          i.scannerKey,
          i.scanDate,
          userFunction_dateIntegerToString(i.scanDate) as scanDateString,
          i.scanTime,
          userFunction_timeIntegerToString(i.scanTime) as scanTimeString
          from InventoryBatchItems i
          where i.batchId = ?
            and i.recordDelete_timeMillis is null
        ) i

        ${whereClause}
        group by itemStoreroom, itemNumber
        ${havingClause}
        order by itemStoreroom, itemNumber`)
        .all(parameters);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result;
}
