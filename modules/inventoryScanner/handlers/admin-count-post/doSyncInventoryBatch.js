import getInventoryBatch from '../../database-count/getInventoryBatch.js';
import syncInventoryBatch from '../../database-count/syncInventoryBatch.js';
export default function handler(request, response) {
    const success = syncInventoryBatch(request.body.batchId, request.session.user);
    const batch = getInventoryBatch(request.body.batchId, request.body);
    response.json({ batch, success });
}
