import type { ConfigFtpPath } from '../types/config.helperTypes.js';
export declare function downloadFilesToTemp<S extends string>(ftpPath: ConfigFtpPath<S>): Promise<Array<`${string}${S}`>>;
export declare function uploadFile(targetFtpFolderPath: string, localFilePath: string): Promise<boolean>;
