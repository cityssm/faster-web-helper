import type { WorkOrderType } from '../types.js';
export default function getUnsyncedWorkOrderNumbersAndRepairIds(workOrderType?: WorkOrderType): {
    workOrderNumbers: string[];
    repairIds: number[];
};
