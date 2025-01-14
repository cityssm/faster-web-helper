import { configDefaultValues } from '../data/config.defaultValues.js';
export declare function getConfigProperty<K extends keyof typeof configDefaultValues>(propertyName: K, fallbackValue?: (typeof configDefaultValues)[K]): (typeof configDefaultValues)[K];
export declare const ntfyServerIsDefault: boolean;
