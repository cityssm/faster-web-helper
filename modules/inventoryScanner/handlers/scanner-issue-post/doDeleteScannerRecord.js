import deleteScannerRecord from '../../database-issue/deleteScannerRecord.js';
import getScannerRecords from '../../database-issue/getScannerRecords.js';
export default function handler(request, response) {
    const success = deleteScannerRecord(request.body.recordId, undefined, request.body.scannerKey);
    const records = getScannerRecords({
        scannerKey: request.body.scannerKey
    });
    response.json({ success, records });
}
