import type { ActiveDirectoryAuthenticatorConfiguration, ADWebAuthAuthenticatorConfiguration, PlainTextAuthenticatorConfiguration } from '@cityssm/authentication-helper';
import type { mssql } from '@cityssm/mssql-multi-pool';
import type { nodeSchedule } from '@cityssm/scheduled-task';
import type { AccessOptions } from 'basic-ftp';
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';
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
        domain: string;
        authentication: {
            type: 'activeDirectory';
            config: ActiveDirectoryAuthenticatorConfiguration;
        } | {
            type: 'adWebAuth';
            config: ADWebAuthAuthenticatorConfiguration;
        } | {
            type: 'plainText';
            config: PlainTextAuthenticatorConfiguration;
        };
    };
    smtp?: SMTPTransport.Options;
    ntfy?: {
        server: string;
    };
    worktech?: mssql.config;
    dynamicsGP?: mssql.config;
    modules: {
        autocomplete?: ConfigModule<ConfigModuleAutocomplete>;
        inventoryScanner?: ConfigModule<ConfigModuleInventoryScanner>;
        integrityChecker?: ConfigModule<ConfigModuleIntegrityChecker>;
        tempFolderCleanup?: ConfigModule<ConfigModuleTempFolderCleanup>;
    };
}
type ConfigModule<T> = ({
    isEnabled: false;
} & Partial<T>) | ({
    isEnabled: true;
} & T);
export interface ConfigFasterWeb {
    tenantOrBaseUrl: string;
    apiUserName?: string;
    apiPassword?: string;
    appUserName?: string;
    appPassword?: string;
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
    schedule?: nodeSchedule.Spec;
    maxAgeDays?: number;
}
export {};
