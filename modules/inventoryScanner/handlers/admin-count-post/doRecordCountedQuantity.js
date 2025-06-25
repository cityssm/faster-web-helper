import createOrUpdateInventoryBatchItem from '../../database-count/createOrUpdateInventoryBatchItem.js';
export default function handler(request, response) {
    const result = createOrUpdateInventoryBatchItem(request.body, request.session.user);
    response.json(result);
}
