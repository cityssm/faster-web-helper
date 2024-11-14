import getItemValidationRecords from '../../database/getItemValidationRecords.js';
export default function handler(request, response) {
    const inventory = getItemValidationRecords();
    response.json({ inventory });
}
