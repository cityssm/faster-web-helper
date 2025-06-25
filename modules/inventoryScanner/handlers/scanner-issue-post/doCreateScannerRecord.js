import createOrUpdateScannerRecord from '../../database-issue/createOrUpdateScannerRecord.js';
import getScannerRecords from '../../database-issue/getScannerRecords.js';
export default function handler(request, response) {
    const success = createOrUpdateScannerRecord(request.body);
    if (request.body.repairId === '' &&
        request.body.quantityMultiplier === '1' &&
        process.send !== undefined) {
        process.send({
            // eslint-disable-next-line no-secrets/no-secrets
            destinationTaskName: 'inventoryScanner_updateRecordsFromValidation',
            timeMillis: Date.now()
        });
    }
    const records = getScannerRecords({
        scannerKey: request.body.scannerKey
    });
    response.json({ success, records });
}
