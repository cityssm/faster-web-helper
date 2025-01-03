import createScannerRecord from '../../database/createScannerRecord.js';
import getScannerRecords from '../../database/getScannerRecords.js';
export default function handler(request, response) {
    const success = createScannerRecord(request.body);
    const records = getScannerRecords({
        scannerKey: request.body.scannerKey
    });
    response.json({ success, records });
}
