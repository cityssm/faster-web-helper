import deleteScannerRecord from '../../database-issue/deleteScannerRecord.js';
import getScannerRecords from '../../database-issue/getScannerRecords.js';
export default function handler(request, response) {
    const success = deleteScannerRecord(request.body.recordId, request.session.user);
    const pendingRecords = getScannerRecords({ isSynced: false }, { limit: -1 });
    response.json({ success, pendingRecords });
}
