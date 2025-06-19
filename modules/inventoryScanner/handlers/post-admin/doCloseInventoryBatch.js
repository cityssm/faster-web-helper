import closeInventoryBatch from '../../database/closeInventoryBatch.js';
import getInventoryBatch from '../../database/getInventoryBatch.js';
export default function handler(request, response) {
    const success = closeInventoryBatch(request.body.batchId, request.session.user);
    const batch = getInventoryBatch(request.body.batchId);
    response.json({ batch, success });
}
