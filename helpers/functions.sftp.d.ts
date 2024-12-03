import type { ConfigFtpPath } from '../types/configHelperTypes.js';
export declare function downloadFilesToTemp<S extends string>(ftpPath: ConfigFtpPath<S>): Promise<Array<`${string}${S}`>>;
