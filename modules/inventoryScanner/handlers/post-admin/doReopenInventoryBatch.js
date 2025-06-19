import getInventoryBatch from '../../database/getInventoryBatch.js';
import reopenInventoryBatch from '../../database/reopenInventoryBatch.js';
export default function handler(request, response) {
    const success = reopenInventoryBatch(request.body.batchId, request.session.user);
    const batch = getInventoryBatch(request.body.batchId);
    response.json({ batch, success });
}
