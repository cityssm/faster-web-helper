import { getAvailableInventoryBatches } from '../../database-count/getInventoryBatches.js';
export default function handler(request, response) {
    const inventoryBatches = getAvailableInventoryBatches();
    response.json({ inventoryBatches });
}
