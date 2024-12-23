import sqlite from 'better-sqlite3';
import type { ItemValidationRecord } from '../types.js';
export default function getItemValidationRecords(): ItemValidationRecord[];
export declare function getItemValidationRecordsByItemNumber(itemNumber: string, connectedDatabase?: sqlite.Database): ItemValidationRecord[];
