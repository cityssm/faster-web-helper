import type { Spec } from 'node-schedule';
export interface ConfigFtpPath<S extends string> {
    directory: string;
    filePrefix?: string;
    fileSuffix?: S;
    doDelete?: boolean;
}
export interface ConfigScheduledFtpReport<S extends string> {
    ftpPath: ConfigFtpPath<S>;
    schedule: Spec;
}
export type ConfigFileSuffixXlsx = `${string}.xlsx` | `${string}.XLSX`;
