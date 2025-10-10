import Papa from 'papaparse';
import getScannerRecords from '../../database-issue/getScannerRecords.js';
export default function handler(request, response) {
    const filters = {
        workOrderType: request.query.workOrderType === ''
            ? undefined
            : request.query.workOrderType,
        scanDateStringFrom: request.query.scanDateStringFrom === ''
            ? undefined
            : request.query.scanDateStringFrom,
        scanDateStringTo: request.query.scanDateStringTo === ''
            ? undefined
            : request.query.scanDateStringTo
    };
    const scannerRecords = getScannerRecords(filters);
    if (request.query.outputFormat === 'csv') {
        const csv = Papa.unparse(scannerRecords, {
            header: true,
            delimiter: ','
        });
        response.setHeader('Content-Disposition', 'attachment; filename="issueRecords.csv"');
        response.setHeader('Content-Type', 'text/csv');
        response.send(csv);
    }
    else {
        response.json({
            issueRecords: scannerRecords,
            options: {
                outputFormat: request.query.outputFormat ?? 'json',
                workOrderType: filters.workOrderType ?? '',
                scanDateStringFrom: filters.scanDateStringFrom ?? '',
                scanDateStringTo: filters.scanDateStringTo ?? ''
            }
        });
    }
}
