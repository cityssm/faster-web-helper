import closeInventoryBatch from '../../database-count/closeInventoryBatch.js';
import getInventoryBatch from '../../database-count/getInventoryBatch.js';
export default function handler(request, response) {
    const success = closeInventoryBatch(request.body.batchId, request.session.user);
    const batch = getInventoryBatch(request.body.batchId, request.body);
    response.json({ batch, success });
}
