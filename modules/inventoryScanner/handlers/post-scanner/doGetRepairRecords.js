import getWorkOrderValidationRecords from '../../database/getWorkOrderValidationRecords.js';
import { getWorkOrderTypeFromWorkOrderNumber } from '../../helpers/workOrders.helpers.js';
export default function handler(request, response) {
    const workOrderType = getWorkOrderTypeFromWorkOrderNumber(request.body.workOrderNumber);
    const records = getWorkOrderValidationRecords(request.body.workOrderNumber, workOrderType);
    if (records.length === 0) {
        const destinationTaskName = workOrderType === 'worktech'
            ? 'inventoryScanner.workOrderValidation.worktech'
            : 'inventoryScanner.workOrderValidation.fasterApi';
        const workerMessage = {
            destinationTaskName,
            messageType: request.body.workOrderNumber,
            timeMillis: Date.now()
        };
        if (process.send !== undefined) {
            process.send(workerMessage);
        }
    }
    response.json({ records });
}
