import { getOpenedInventoryBatch } from '../../database-count/getInventoryBatch.js';
export default function handler(request, response) {
    const batch = getOpenedInventoryBatch(false, true);
    batch.batchItems ??= [];
    response.json({ batch });
}
