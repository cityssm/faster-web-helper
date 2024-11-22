import getWorkOrderValidationRecords from '../../database/getWorkOrderValidationRecords.js';
import { getWorkOrderTypeFromWorkOrderNumber } from '../../helpers/workOrders.js';
export default function handler(request, response) {
    const workOrderType = getWorkOrderTypeFromWorkOrderNumber(request.body.workOrderNumber);
    const records = getWorkOrderValidationRecords(request.body.workOrderNumber, workOrderType);
    response.json({ records });
}
