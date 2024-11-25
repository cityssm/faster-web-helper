import deleteScannerRecord from '../../database/deleteScannerRecord.js';
import getScannerRecords from '../../database/getScannerRecords.js';
export default function handler(request, response) {
    const success = deleteScannerRecord(request.body.recordId, request.body.scannerKey);
    const records = getScannerRecords({
        scannerKey: request.body.scannerKey
    });
    response.json({ success, records });
}
