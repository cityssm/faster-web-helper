import sqlite from 'better-sqlite3';
import type { WorkOrderType, WorkOrderValidationRecord } from '../types.js';
export default function getWorkOrderValidation(validationRecord: {
    workOrderNumber: string;
    workOrderType: WorkOrderType;
    repairId?: number;
}, includeDeleted: boolean, connectedDatabase?: sqlite.Database): WorkOrderValidationRecord | undefined;
