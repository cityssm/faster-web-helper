import deleteScannerRecord from '../../database/deleteScannerRecord.js';
import getScannerRecords from '../../database/getScannerRecords.js';
export default function handler(request, response) {
    let deleteCount = 0;
    for (const recordId of request.body.recordIds) {
        if (deleteScannerRecord(recordId, request.session.user)) {
            deleteCount += 1;
        }
    }
    const syncErrorRecords = getScannerRecords({
        isSynced: true,
        isSyncedSuccessfully: false
    });
    response.json({
        success: deleteCount === request.body.recordIds.length,
        syncErrorRecords
    });
}
