import type { ConfigFtpPath } from '../types/configTypes.js';
export declare function downloadFilesToTemp<S extends string>(ftpPath: ConfigFtpPath<S>): Promise<Array<`${string}${S}`>>;
