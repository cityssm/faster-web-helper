import getInventoryBatch from '../../database/getInventoryBatch.js';
import syncInventoryBatch from '../../database/syncInventoryBatch.js';
export default function handler(request, response) {
    const success = syncInventoryBatch(request.body.batchId, request.session.user);
    const batch = getInventoryBatch(request.body.batchId);
    response.json({ batch, success });
}
