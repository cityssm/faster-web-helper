import type { TaskName } from '../types/tasks.types.js';
export declare function getScheduledTaskMinutes(taskName: TaskName): number[];
export declare function getMinimumMillisBetweenRuns(taskName: TaskName): number;
