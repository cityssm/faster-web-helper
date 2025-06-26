import getInventoryBatch from '../../database-count/getInventoryBatch.js';
import reopenInventoryBatch from '../../database-count/reopenInventoryBatch.js';
export default function handler(request, response) {
    const result = reopenInventoryBatch(request.body.batchId, request.session.user);
    const batch = getInventoryBatch(request.body.batchId);
    response.json({ batch, success: result.success, message: result.message });
}
