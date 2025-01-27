import type sqlite from 'better-sqlite3';
import type { NhtsaVehicle } from '../types.js';
export default function createOrUpdateNhtsaVehicle(nhtsaVehicle: NhtsaVehicle, connectedDatabase: sqlite.Database): boolean;
