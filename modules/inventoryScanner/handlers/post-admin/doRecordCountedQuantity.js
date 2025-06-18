import createOrUpdateInventoryBatchItem from '../../database/createOrUpdateInventoryBatchItem.js';
export default function handler(request, response) {
    const result = createOrUpdateInventoryBatchItem(request.body, request.session.user);
    response.json(result);
}
