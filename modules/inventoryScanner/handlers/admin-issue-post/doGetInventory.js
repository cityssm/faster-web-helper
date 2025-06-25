import getItemValidationRecords from '../../database-issue/getItemValidationRecords.js';
export default function handler(request, response) {
    const inventory = getItemValidationRecords();
    response.json({ inventory });
}
