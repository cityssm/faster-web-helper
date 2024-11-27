import getScannerRecords from '../../database/getScannerRecords.js';
export default function handler(request, response) {
    const pendingRecords = getScannerRecords({ isSynced: false }, { limit: -1 });
    response.json({ pendingRecords });
}
