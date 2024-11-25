import getScannerRecords from '../../database/getScannerRecords.js';
export default function handler(request, response) {
    const records = getScannerRecords({
        scannerKey: request.body.scannerKey
    });
    response.json({ records });
}
