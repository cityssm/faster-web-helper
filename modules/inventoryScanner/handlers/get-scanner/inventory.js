import { getOpenedInventoryBatch } from '../../database/getInventoryBatch.js';
export default function handler(request, response) {
    const openBatch = getOpenedInventoryBatch(false, false);
    if (openBatch === undefined) {
        response.render('inventoryScanner/inventoryScannerCreate', {});
    }
    else {
        response.render('inventoryScanner/inventoryScanner', {
            headTitle: 'Inventory Scanner',
            openBatch
        });
    }
}
