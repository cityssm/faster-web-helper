import { type ChildProcess } from 'node:child_process';
import type express from 'express';
import type { TaskName } from '../../types/tasks.types.js';
export declare function initializeInventoryScannerTasks(): Partial<Record<TaskName, ChildProcess>>;
export declare function initializeInventoryScannerAppHandlers(app: express.Application): void;
