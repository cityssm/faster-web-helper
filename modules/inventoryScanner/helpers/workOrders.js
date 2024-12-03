// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-secrets/no-secrets */
import { getConfigProperty } from '../../../helpers/functions.config.js';
export function getWorkOrderTypeFromWorkOrderNumber(workOrderNumber) {
    if (getConfigProperty('modules.inventoryScanner.workOrders.acceptWorkTech') &&
        getConfigProperty('modules.inventoryScanner.workOrders.workTechRegex').test(workOrderNumber)) {
        return 'worktech';
    }
    return 'faster';
}
export function sortScannerRecordsByWorkOrderType(records) {
    const recordsObject = {};
    for (const record of records) {
        if (Object.hasOwn(recordsObject, record.workOrderType)) {
            recordsObject[record.workOrderType]?.push(record);
        }
        else {
            recordsObject[record.workOrderType] = [record];
        }
    }
    return recordsObject;
}
