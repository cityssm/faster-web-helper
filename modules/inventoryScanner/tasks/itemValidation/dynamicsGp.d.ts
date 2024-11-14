export declare const taskName = "Inventory Validation Task - Dynamics GP";
export declare function runUpdateItemValidationFromDynamicsGpTask(): Promise<void>;
declare const _default: {
    taskName: string;
    schedule: import("node-schedule").Spec;
    task: typeof runUpdateItemValidationFromDynamicsGpTask;
};
export default _default;
