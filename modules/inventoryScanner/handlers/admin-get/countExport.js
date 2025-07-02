import getInventoryBatch from '../../database-count/getInventoryBatch.js';
import { countBatchToCSV } from '../../helpers/countExport.helpers.js';
export default function handler(request, response) {
    const batchId = request.params.batchId;
    const batch = getInventoryBatch(batchId, {
        itemsToInclude: 'counted'
    });
    if (batch === undefined) {
        response.status(404).json({
            message: `Batch with ID ${batchId} not found.`,
            success: false
        });
        return;
    }
    if (batch.recordSync_timeMillis === null) {
        response.status(400).json({
            message: `Batch with ID ${batchId} has not been synced.`,
            success: false
        });
        return;
    }
    if (batch.batchItems === undefined || batch.batchItems.length === 0) {
        response.status(400).json({
            message: `Batch with ID ${batchId} has no counted items.`,
            success: false
        });
        return;
    }
    const csv = countBatchToCSV(batch);
    response.setHeader('Content-Type', 'text/csv');
    response.setHeader('Content-Disposition', `attachment; filename="countBatch-${batchId}.csv"`);
    response.status(200).send(csv);
}
