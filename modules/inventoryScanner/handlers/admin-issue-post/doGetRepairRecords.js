import getWorkOrderValidationRecords from '../../database-issue/getWorkOrderValidationRecords.js';
import { getWorkOrderTypeFromWorkOrderNumber } from '../../helpers/workOrders.helpers.js';
export default function handler(request, response) {
    const workOrderType = getWorkOrderTypeFromWorkOrderNumber(request.body.workOrderNumber);
    const records = getWorkOrderValidationRecords(request.body.workOrderNumber, workOrderType);
    response.json({ records });
}
