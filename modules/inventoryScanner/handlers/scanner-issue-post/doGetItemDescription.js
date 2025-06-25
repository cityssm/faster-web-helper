import { getItemValidationRecordsByItemNumber } from '../../database-issue/getItemValidationRecords.js';
export default function handler(request, response) {
    const itemValidationRecords = getItemValidationRecordsByItemNumber(request.body.itemNumber, '');
    if (itemValidationRecords.length === 0) {
        response.json({
            itemDescription: `Item Not Found: ${request.body.itemNumber}`
        });
    }
    else {
        response.json({
            itemDescription: itemValidationRecords[0].itemDescription,
            unitPrice: itemValidationRecords[0].unitPrice
        });
    }
}
