import getMaxWorkOrderValidationRepairId from '../database/getMaxWorkOrderValidationRecordRepairId.js';
import getUnsyncedWorkOrderNumbersAndRepairIds from '../database/getUnsyncedWorkOrderNumbersAndRepairIds.js';
import getWorkOrderValidationRepairIds from '../database/getWorkOrderValidationRepairIds.js';
const lookAheadRepairIdCount = 100;
export function getRepairIdsToRefresh() {
    /*
     * Include any repair ids for unsent scanner records
     */
    const unsyncedNumbers = getUnsyncedWorkOrderNumbersAndRepairIds('faster');
    const repairIdSet = new Set(unsyncedNumbers.repairIds.values());
    if (unsyncedNumbers.workOrderNumbers.length > 0) {
        const correspondingRepairIds = getWorkOrderValidationRepairIds(unsyncedNumbers.workOrderNumbers, 'faster');
        for (const possibleRepairId of correspondingRepairIds) {
            repairIdSet.add(possibleRepairId.repairId);
        }
    }
    /*
     * Add look ahead repair ids
     */
    const maxRepairId = getMaxWorkOrderValidationRepairId('faster');
    for (let repairId = maxRepairId + 1; repairId <= maxRepairId + lookAheadRepairIdCount; repairId += 1) {
        repairIdSet.add(repairId);
    }
    /*
     * Return set as array
     */
    return [...repairIdSet.values()];
}
