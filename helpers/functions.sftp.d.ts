import type { ConfigFtpPath } from '../types/configTypes.js';
export declare const tempFolderPath: string;
export declare function ensureTempFolderExists(): Promise<void>;
export declare function downloadFilesToTemp<S extends string>(ftpPath: ConfigFtpPath<S>): Promise<Array<`${string}${S}`>>;
