import sqlite from 'better-sqlite3';
import type { ItemValidationRecord } from '../types.js';
export default function getItemValidationRecords(itemNumberPrefix?: string): ItemValidationRecord[];
export declare function getItemValidationRecordsByItemNumber(itemNumber: string, itemNumberPrefix: string, connectedDatabase?: sqlite.Database): ItemValidationRecord[];
