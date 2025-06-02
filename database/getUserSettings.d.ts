import type sqlite from 'better-sqlite3';
import type { userSettingNames } from '../helpers/userSettings.helpers.js';
export declare function getUserSettings(userName: string, connectedDatabase: sqlite.Database): Partial<Record<(typeof userSettingNames)[number], string | null>>;
