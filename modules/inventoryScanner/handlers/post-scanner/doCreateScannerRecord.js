import createOrUpdateScannerRecord from '../../database/createOrUpdateScannerRecord.js';
import getScannerRecords from '../../database/getScannerRecords.js';
export default function handler(request, response) {
    const success = createOrUpdateScannerRecord(request.body);
    if (request.body.repairId === '' &&
        request.body.quantityMultiplier === '1' &&
        process.send !== undefined) {
        process.send({
            destinationTaskName: 'inventoryScanner.updateRecordsFromValidation',
            timeMillis: Date.now()
        });
    }
    const records = getScannerRecords({
        scannerKey: request.body.scannerKey
    });
    response.json({ success, records });
}
