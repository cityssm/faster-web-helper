import type { W223StoreroomReportData } from '@cityssm/faster-report-parser/xlsx';
import { type ResourceItem, type WorkOrderResource } from '@cityssm/worktech-api';
import type { WorkOrderNumberMapping } from '../worktechUpdateTypes.js';
export declare function getOrCreateStoreroomResourceItem(storeroomData: W223StoreroomReportData): Promise<ResourceItem>;
export interface W223HashableTransactionReportData {
    documentNumber: number;
    itemNumber: string;
    quantity: number;
    unitTrueCost: number;
    createdDateTime: string;
}
export declare function buildWorkOrderResourceDescriptionHash(storeroomData: W223StoreroomReportData, transactionData: W223HashableTransactionReportData, occuranceIndex: number): string;
export declare function getWorkOrderResources(workOrderNumberMapping: WorkOrderNumberMapping): Promise<WorkOrderResource[]>;
