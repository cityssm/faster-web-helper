import type { DateString } from '@cityssm/utils-datetime';
import type { Request, Response } from 'express';
import type { InventoryScannerRecord, WorkOrderType } from '../../types.js';
interface ExportIssueRecordsOptions {
    scanDateStringFrom: '' | DateString;
    scanDateStringTo: '' | DateString;
    workOrderType: '' | WorkOrderType;
    outputFormat: 'csv' | 'json';
}
export default function handler(request: Request<unknown, unknown, unknown, Partial<ExportIssueRecordsOptions>>, response: Response<{
    issueRecords: InventoryScannerRecord[];
    options: ExportIssueRecordsOptions;
} | string>): void;
export {};
