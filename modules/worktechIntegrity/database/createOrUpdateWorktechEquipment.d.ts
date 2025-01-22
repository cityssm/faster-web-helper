import type sqlite from 'better-sqlite3';
import type { IntegrityWorktechEquipment } from '../types.js';
export declare function createOrUpdateWorktechEquipment(worktechEquipment: IntegrityWorktechEquipment, connectedDatabase: sqlite.Database): boolean;
