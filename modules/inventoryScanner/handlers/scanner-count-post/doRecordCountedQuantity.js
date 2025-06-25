import createOrUpdateInventoryBatchItem from '../../database-count/createOrUpdateInventoryBatchItem.js';
export default function handler(request, response) {
    const result = createOrUpdateInventoryBatchItem(request.body);
    response.json(result);
}
