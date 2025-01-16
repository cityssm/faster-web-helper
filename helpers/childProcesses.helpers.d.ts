import type { ChildProcess } from 'node:child_process';
import type { TaskName, TaskWorkerMessage } from '../types/tasks.types.js';
export declare function registerChildProcesses(childProcesses: Partial<Record<TaskName, ChildProcess>>): void;
/**
 * Relays a message to a child process.
 * **Note that this should not be used directly.**
 * Instead, use `process.send` to send messages to the primary process.
 * @param message - The message to relay to the child process.
 * @returns `true` if the message was relayed to the child process, `false` if the child process is not registered.
 */
export declare function relayMessageToChildProcess(message: TaskWorkerMessage): boolean;
