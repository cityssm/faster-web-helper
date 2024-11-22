import createScannerRecord from '../../database/createScannerRecord.js';
export default function handler(request, response) {
    const success = createScannerRecord(request.body);
    response.json({ success });
}
