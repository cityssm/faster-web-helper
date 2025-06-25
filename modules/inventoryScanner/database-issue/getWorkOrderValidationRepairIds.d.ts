import type { WorkOrderType } from '../types.js';
export default function getWorkOrderValidationRepairIds(workOrderNumbers: string[], workOrderType?: WorkOrderType): Array<{
    repairId: number;
}>;
