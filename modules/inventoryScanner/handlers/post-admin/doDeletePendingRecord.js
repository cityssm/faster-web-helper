import deleteScannerRecord from '../../database/deleteScannerRecord.js';
import getScannerRecords from '../../database/getScannerRecords.js';
export default function handler(request, response) {
    const success = deleteScannerRecord(request.body.recordId, request.session.user);
    const pendingRecords = getScannerRecords({ isSynced: false }, { limit: -1 });
    response.json({ success, pendingRecords });
}
