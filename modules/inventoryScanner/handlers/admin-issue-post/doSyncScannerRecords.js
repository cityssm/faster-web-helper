import { fork } from 'node:child_process';
import getScannerRecords from '../../database-issue/getScannerRecords.js';
import { markPendingScannerRecordsForSync } from '../../database-issue/markPendingScannerRecordsForSync.js';
export default function handler(request, response) {
    const syncedRecordCount = markPendingScannerRecordsForSync(request.session.user);
    fork('./modules/inventoryScanner/tasks/onDemand/syncScannerRecords.onDemand.js');
    const pendingRecords = getScannerRecords({ isSynced: false }, { limit: -1 });
    response.json({ syncedRecordCount, pendingRecords });
}
