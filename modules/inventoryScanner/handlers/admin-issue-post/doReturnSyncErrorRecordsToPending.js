import getScannerRecords from '../../database-issue/getScannerRecords.js';
import { markSyncErrorScannerRecordForPending } from '../../database-issue/markSyncErrorScannerRecordForPending.js';
export default function handler(request, response) {
    let returnCount = 0;
    for (const recordId of request.body.recordIds) {
        if (markSyncErrorScannerRecordForPending(recordId, 
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        request.session.user)) {
            returnCount += 1;
        }
    }
    const pendingRecords = getScannerRecords({ isSynced: false }, { limit: -1 });
    const syncErrorRecords = getScannerRecords({
        isSynced: true,
        isSyncedSuccessfully: false
    });
    response.json({
        success: returnCount === request.body.recordIds.length,
        pendingRecords,
        syncErrorRecords
    });
}
