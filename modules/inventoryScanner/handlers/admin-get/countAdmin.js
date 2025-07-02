import { getOpenedInventoryBatch } from '../../database-count/getInventoryBatch.js';
export default function handler(request, response) {
    const openBatch = getOpenedInventoryBatch(true, false);
    response.render('inventoryScanner/adminCount', {
        headTitle: 'Inventory Scanner',
        openBatch
    });
}
