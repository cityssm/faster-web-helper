import { getOpenedInventoryBatch } from '../../database-count/getInventoryBatch.js';
export default function handler(request, response) {
    const openBatch = getOpenedInventoryBatch(false, false);
    if (openBatch === undefined) {
        response.render('inventoryScanner/countScannerCreate', {});
    }
    else {
        response.render('inventoryScanner/countScanner', {
            headTitle: 'Count Scanner',
            openBatch
        });
    }
}
