import type { AccessOptions } from 'basic-ftp';
import type { config as MSSQLConfig } from 'mssql';
import type { Spec } from 'node-schedule';
export interface Config {
    ftp: AccessOptions;
    worktech?: MSSQLConfig;
    modules: {
        inventoryScanner?: ConfigModule<ConfigModuleInventoryScanner>;
        worktechUpdate?: ConfigModule<ConfigModuleWorktechUpdate>;
    };
}
type ConfigModule<T> = ({
    isEnabled: false;
} & Partial<T>) | ({
    isEnabled: true;
} & T);
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
interface ConfigModuleInventoryScanner {
    reports: {
        /**
         * W200 - Inventory Report
         */
        w200: ConfigScheduledFtpReport<ConfigFileSuffixXlsx>;
        /**
         * W311 - Active Work Orders by Shop
         */
        w311: ConfigScheduledFtpReport<ConfigFileSuffixXlsx>;
        /**
         * W604 - Integration Log Viewer
         */
        w604: ConfigScheduledFtpReport<ConfigFileSuffixXlsx>;
    };
}
interface ConfigModuleWorktechUpdate {
    reports: {
        /**
         * W217 - Direct Charge Transactions
         */
        w217: ConfigScheduledFtpReport<ConfigFileSuffixXlsx>;
        /**
         * W223 - Inventory Transaction Details Report
         */
        w223: ConfigScheduledFtpReport<ConfigFileSuffixXlsx>;
    };
}
export {};
