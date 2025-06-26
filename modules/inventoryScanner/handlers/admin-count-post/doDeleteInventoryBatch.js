import deleteInventoryBatch from '../../database-count/deleteInventoryBatch.js';
export default function handler(request, response) {
    const success = deleteInventoryBatch(request.body.batchId, request.session.user);
    response.json({ success });
}
