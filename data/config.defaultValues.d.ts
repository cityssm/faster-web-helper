import type { ADWebAuthAuthenticatorConfiguration, ActiveDirectoryAuthenticatorConfiguration } from '@cityssm/authentication-helper';
import type { AccessOptions } from 'basic-ftp';
import type { config as MSSQLConfig } from 'mssql';
import type { Spec } from 'node-schedule';
import type { ConfigItemValidationDynamicsGP, ConfigItemValidationFaster } from '../modules/inventoryScanner/configTypes.js';
import type { ConfigFileSuffixXlsx, ConfigScheduledFtpReport } from '../types/configHelperTypes.js';
export declare const configDefaultValues: {
    ftp: AccessOptions;
    'webServer.httpPort': number;
    'webServer.urlPrefix': string;
    'webServer.session.cookieName': string;
    'webServer.session.secret': string;
    'webServer.session.maxAgeMillis': number;
    'login.domain': string;
    'login.authentication': {
        type: "activeDirectory";
        config: ActiveDirectoryAuthenticatorConfiguration;
    } | {
        type: "adWebAuth";
        config: ADWebAuthAuthenticatorConfiguration;
    } | undefined;
    'fasterWeb.tenant': string | undefined;
    worktech: MSSQLConfig | undefined;
    dynamicsGP: MSSQLConfig | undefined;
    'modules.autocomplete.isEnabled': boolean;
    'modules.autocomplete.runOnStartup': boolean;
    'modules.autocomplete.reports.w114': ConfigScheduledFtpReport<ConfigFileSuffixXlsx> | undefined;
    'modules.autocomplete.reports.w200': ConfigScheduledFtpReport<ConfigFileSuffixXlsx> | undefined;
    'modules.inventoryScanner.isEnabled': boolean;
    'modules.inventoryScanner.runOnStartup': boolean;
    'modules.inventoryScanner.scannerIpAddressRegex': RegExp;
    'modules.inventoryScanner.workOrders.acceptNotValidated': boolean;
    'modules.inventoryScanner.workOrders.fasterRegex': RegExp;
    'modules.inventoryScanner.workOrders.acceptWorkTech': boolean;
    'modules.inventoryScanner.workOrders.workTechRegex': RegExp;
    'modules.inventoryScanner.items.acceptNotValidated': boolean;
    'modules.inventoryScanner.items.itemNumberRegex': RegExp | undefined;
    'modules.inventoryScanner.items.validation': ConfigItemValidationDynamicsGP | ConfigItemValidationFaster | undefined;
    'modules.inventoryScanner.quantities.acceptOverages': boolean;
    'modules.inventoryScanner.quantities.acceptNegatives': boolean;
    'modules.inventoryScanner.reports.w311': ConfigScheduledFtpReport<ConfigFileSuffixXlsx> | undefined;
    'modules.inventoryScanner.reports.w604': ConfigScheduledFtpReport<ConfigFileSuffixXlsx> | undefined;
    'modules.worktechUpdate.isEnabled': boolean;
    'modules.worktechUpdate.runOnStartup': boolean;
    'modules.worktechUpdate.resourceItem.itemClass': string;
    'modules.worktechUpdate.resourceItem.itemType': string;
    'modules.worktechUpdate.resourceItem.unit': string;
    'modules.worktechUpdate.reports.w114': ConfigScheduledFtpReport<ConfigFileSuffixXlsx> | undefined;
    'modules.worktechUpdate.reports.w217': ConfigScheduledFtpReport<ConfigFileSuffixXlsx> | undefined;
    'modules.worktechUpdate.reports.w223': ConfigScheduledFtpReport<ConfigFileSuffixXlsx> | undefined;
    'modules.tempFolderCleanup.isEnabled': boolean;
    'modules.tempFolderCleanup.runOnStartup': boolean;
    'modules.tempFolderCleanup.schedule': Spec;
    'modules.tempFolderCleanup.maxAgeDays': number;
};
