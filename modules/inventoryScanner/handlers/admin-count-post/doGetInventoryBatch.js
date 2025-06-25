import getInventoryBatch from '../../database-count/getInventoryBatch.js';
export default function handler(request, response) {
    const batch = getInventoryBatch(request.body.batchId);
    response.json({ batch });
}
