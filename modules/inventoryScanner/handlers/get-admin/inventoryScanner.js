import { getOpenedInventoryBatch } from '../../database/getInventoryBatch.js';
export default function handler(request, response) {
    const openBatch = getOpenedInventoryBatch(true, false);
    response.render('inventoryScanner/adminInventory', {
        headTitle: 'Inventory Scanner',
        openBatch
    });
}
