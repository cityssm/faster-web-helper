import getScannerRecords from '../../database/getScannerRecords.js';
import { updateScannerRecord } from '../../database/updateScannerRecord.js';
export default function handler(request, response) {
    const success = updateScannerRecord(request.body, request.session.user);
    const pendingRecords = getScannerRecords({ isSynced: false }, { limit: -1 });
    response.json({ success, pendingRecords });
}
