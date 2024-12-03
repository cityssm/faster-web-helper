import getItemValidationRecords from '../../database/getItemValidationRecords.js';
import getScannerRecords from '../../database/getScannerRecords.js';
import getSetting from '../../database/getSetting.js';
export default function handler(request, response) {
    const pendingRecords = getScannerRecords({ isSynced: false }, { limit: -1 });
    const inventory = getItemValidationRecords();
    const itemRequestsCount = Number.parseInt(getSetting('itemRequests.count') ?? '0');
    response.render('inventoryScanner/admin', {
        headTitle: 'Inventory Scanner',
        inventory,
        pendingRecords,
        itemRequestsCount
    });
}
