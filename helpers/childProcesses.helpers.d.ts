import type { ChildProcess } from 'node:child_process';
import type { TaskName, TaskWorkerMessage } from '../types/tasks.types.js';
export declare function registerChildProcesses(childProcesses: Partial<Record<TaskName, ChildProcess>>): void;
export declare function relayMessageToChildProcess(message: TaskWorkerMessage): boolean;
