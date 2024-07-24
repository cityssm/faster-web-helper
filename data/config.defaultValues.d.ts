import type { AccessOptions } from 'basic-ftp';
import type { config as MSSQLConfig } from 'mssql';
import type { ConfigFileSuffixXlsx, ConfigScheduledFtpReport } from '../types/configTypes.js';
export declare const configDefaultValues: {
    ftp: AccessOptions;
    'webServer.httpPort': number;
    'webServer.urlPrefix': string;
    worktech: MSSQLConfig;
    'modules.autocomplete.isEnabled': boolean;
    'modules.autocomplete.runOnStartup': boolean;
    'modules.autocomplete.reports.w114': ConfigScheduledFtpReport<ConfigFileSuffixXlsx> | undefined;
    'modules.autocomplete.reports.w200': ConfigScheduledFtpReport<ConfigFileSuffixXlsx> | undefined;
    'modules.inventoryScanner.isEnabled': boolean;
    'modules.inventoryScanner.runOnStartup': boolean;
    'modules.inventoryScanner.reports.w200': ConfigScheduledFtpReport<ConfigFileSuffixXlsx>;
    'modules.inventoryScanner.reports.w311': ConfigScheduledFtpReport<ConfigFileSuffixXlsx>;
    'modules.inventoryScanner.reports.w604': ConfigScheduledFtpReport<ConfigFileSuffixXlsx>;
    'modules.worktechUpdate.isEnabled': boolean;
    'modules.worktechUpdate.runOnStartup': boolean;
    'modules.worktechUpdate.resourceItem.itemClass': string;
    'modules.worktechUpdate.resourceItem.itemType': string;
    'modules.worktechUpdate.resourceItem.unit': string;
    'modules.worktechUpdate.reports.w217': ConfigScheduledFtpReport<ConfigFileSuffixXlsx>;
    'modules.worktechUpdate.reports.w223': ConfigScheduledFtpReport<ConfigFileSuffixXlsx>;
};
