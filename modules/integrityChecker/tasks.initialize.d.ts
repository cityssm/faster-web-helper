import { type ChildProcess } from 'node:child_process';
import type { TaskName } from '../../types/tasks.types.js';
export default function initializeIntegrityCheckerTasks(): Partial<Record<TaskName, ChildProcess>>;
