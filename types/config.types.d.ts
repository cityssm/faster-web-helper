import type { ActiveDirectoryAuthenticatorConfiguration, ADWebAuthAuthenticatorConfiguration, PlainTextAuthenticatorConfiguration } from '@cityssm/authentication-helper';
import type { mssql } from '@cityssm/mssql-multi-pool';
import type { nodeSchedule } from '@cityssm/scheduled-task';
import type { AccessOptions } from 'basic-ftp';
import type { ConfigModuleIntegrityChecker } from '../modules/integrityChecker/config/types.js';
import type { ConfigModuleInventoryScanner } from '../modules/inventoryScanner/config/types.js';
import type { ConfigFileSuffixXlsx, ConfigScheduledFtpReport } from './config.helperTypes.js';
export interface Config {
    application?: {
        workDays?: number[];
        workHours?: number[];
    };
    fasterWeb: ConfigFasterWeb;
    ftp?: AccessOptions;
    webServer?: {
        httpPort: number;
        urlPrefix?: string;
        session?: {
            cookieName?: string;
            secret?: string;
            maxAgeMillis?: number;
        };
    };
    login?: {
        authentication: {
            config: ActiveDirectoryAuthenticatorConfiguration;
            type: 'activeDirectory';
        } | {
            config: ADWebAuthAuthenticatorConfiguration;
            type: 'adWebAuth';
        } | {
            config: PlainTextAuthenticatorConfiguration;
            type: 'plainText';
        };
        domain: string;
    };
    ntfy?: {
        server: string;
    };
    worktech?: mssql.config;
    dynamicsGP?: mssql.config;
    sectorFlow?: {
        apiKey: string;
    };
    modules: {
        autocomplete?: ConfigModule<ConfigModuleAutocomplete>;
        inventoryScanner?: ConfigModule<ConfigModuleInventoryScanner>;
        integrityChecker?: ConfigModule<ConfigModuleIntegrityChecker>;
        tempFolderCleanup?: ConfigModule<ConfigModuleTempFolderCleanup>;
    };
}
type ConfigModule<T> = (Partial<T> & {
    isEnabled: false;
}) | (T & {
    isEnabled: true;
});
export interface ConfigFasterWeb {
    tenantOrBaseUrl: string;
    apiPassword?: string;
    apiUserName?: string;
    appPassword?: string;
    appUserName?: string;
}
interface ConfigModuleAutocomplete {
    reports: {
        /**
         * W114 - Asset Master List
         */
        w114?: ConfigScheduledFtpReport<ConfigFileSuffixXlsx>;
        /**
         * W200 - Inventory Report
         */
        w200?: ConfigScheduledFtpReport<ConfigFileSuffixXlsx>;
    };
}
interface ConfigModuleTempFolderCleanup {
    maxAgeDays?: number;
    schedule?: nodeSchedule.Spec;
}
export {};
