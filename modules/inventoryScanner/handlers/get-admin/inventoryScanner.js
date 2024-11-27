import getItemValidationRecords from '../../database/getItemValidationRecords.js';
import getScannerRecords from '../../database/getScannerRecords.js';
export default function handler(request, response) {
    const pendingRecords = getScannerRecords({ isSynced: false }, { limit: -1 });
    const inventory = getItemValidationRecords();
    response.render('inventoryScanner/admin', {
        headTitle: 'Inventory Scanner',
        inventory,
        pendingRecords
    });
}
