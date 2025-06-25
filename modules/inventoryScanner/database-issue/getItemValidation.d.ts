import sqlite from 'better-sqlite3';
import type { ItemValidationRecord } from '../types.js';
export default function getItemValidation(itemStoreroom: string, itemNumber: string, includeDeleted: boolean, connectedDatabase?: sqlite.Database): ItemValidationRecord | undefined;
