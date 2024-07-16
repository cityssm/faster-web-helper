import type { AccessOptions } from 'basic-ftp';
import type { config as MSSQLConfig } from 'mssql';
import type { ConfigFileSuffixXlsx, ConfigScheduledFtpReport } from '../types/configTypes.js';
export declare const configDefaultValues: {
    ftp: AccessOptions;
    worktech: MSSQLConfig;
    'modules.inventoryScanner.isEnabled': boolean;
    'modules.inventoryScanner.reports.w200': ConfigScheduledFtpReport<ConfigFileSuffixXlsx>;
    'modules.inventoryScanner.reports.w311': ConfigScheduledFtpReport<ConfigFileSuffixXlsx>;
    'modules.inventoryScanner.reports.w604': ConfigScheduledFtpReport<ConfigFileSuffixXlsx>;
    'modules.worktechUpdate.isEnabled': boolean;
    'modules.worktechUpdate.reports.w217': ConfigScheduledFtpReport<ConfigFileSuffixXlsx>;
    'modules.worktechUpdate.reports.w223': ConfigScheduledFtpReport<ConfigFileSuffixXlsx>;
};
