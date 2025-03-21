import type { ADWebAuthAuthenticatorConfiguration, ActiveDirectoryAuthenticatorConfiguration, PlainTextAuthenticatorConfiguration } from '@cityssm/authentication-helper';
import type { nodeSchedule } from '@cityssm/scheduled-task';
import type { AccessOptions } from 'basic-ftp';
import type { config as MSSQLConfig } from 'mssql';
import type { ConfigFileSuffixXlsx, ConfigScheduledFtpReport } from '../types/config.helperTypes.js';
import type { ConfigFasterWeb } from '../types/config.types.js';
export declare const configDefaultValues: {
    'modules.tempFolderCleanup.isEnabled': boolean;
    'modules.tempFolderCleanup.schedule': nodeSchedule.Spec;
    'modules.tempFolderCleanup.maxAgeDays': number;
    'modules.integrityChecker.isEnabled': boolean;
    'modules.integrityChecker.fasterAssets.isEnabled': boolean;
    'modules.integrityChecker.nhtsaVehicles.isEnabled': boolean;
    'modules.integrityChecker.worktechEquipment.isEnabled': boolean;
    'modules.integrityChecker.worktechEquipment.mappingFunctions': import("../modules/integrityChecker/config/types.js").ConfigModuleIntegrityCheckerMappingFunctions;
    'modules.integrityChecker.fasterItems.isEnabled': boolean;
    'modules.integrityChecker.fasterItems.storerooms': string[];
    'modules.integrityChecker.fasterItems.validation.source': string;
    'modules.integrityChecker.fasterItems.validation.gpLocationCodesToFasterStorerooms': Record<string, string>;
    'modules.integrityChecker.fasterItems.validation.gpItemFilter': ((item: import("@cityssm/dynamics-gp").GPItemWithQuantity) => boolean) | undefined;
    'modules.integrityChecker.fasterItems.validation.updateFaster': boolean;
    'modules.integrityChecker.fasterItems.validation.createInvoiceDefaults': import("../modules/integrityChecker/config/types.js").ConfigIntegrityCheckerItemValidationDynamicsGPCreateInvoiceDefaults | undefined;
    'modules.inventoryScanner.isEnabled': boolean;
    'modules.inventoryScanner.scannerIpAddressRegex': RegExp;
    'modules.inventoryScanner.fasterSync.integrationId': number | undefined;
    'modules.inventoryScanner.fasterSync.exportFileNamePrefix': string;
    'modules.inventoryScanner.fasterSync.ftpPath': string;
    'modules.inventoryScanner.fasterSync.defaultTechnicianId': number;
    'modules.inventoryScanner.workOrders.acceptNotValidated': boolean;
    'modules.inventoryScanner.workOrders.fasterRegex': RegExp;
    'modules.inventoryScanner.workOrders.acceptWorkTech': boolean;
    'modules.inventoryScanner.workOrders.workTechRegex': RegExp;
    'modules.inventoryScanner.workOrders.validationSources': Array<"fasterApi" | "worktech">;
    'modules.inventoryScanner.items.acceptNotValidated': boolean;
    'modules.inventoryScanner.items.itemNumberRegex': RegExp | undefined;
    'modules.inventoryScanner.items.placeholder': string;
    'modules.inventoryScanner.items.validation': import("../modules/inventoryScanner/config/types.js").ConfigItemValidationDynamicsGP | import("../modules/inventoryScanner/config/types.js").ConfigItemValidationFaster | undefined;
    'modules.inventoryScanner.fasterItemRequests.isEnabled': boolean;
    'modules.inventoryScanner.fasterItemRequests.ntfy.isEnabled': boolean;
    'modules.inventoryScanner.fasterItemRequests.ntfy.topic': undefined | string;
    'modules.inventoryScanner.quantities.acceptOverages': boolean;
    'modules.inventoryScanner.quantities.acceptNegatives': boolean;
    'application.workDays': number[];
    'application.workHours': number[];
    ftp: AccessOptions | undefined;
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
    } | {
        type: "plainText";
        config: PlainTextAuthenticatorConfiguration;
    } | undefined;
    fasterWeb: ConfigFasterWeb;
    worktech: MSSQLConfig | undefined;
    dynamicsGP: MSSQLConfig | undefined;
    'ntfy.server': string;
    'modules.autocomplete.isEnabled': boolean;
    'modules.autocomplete.runOnStartup': boolean;
    'modules.autocomplete.reports.w114': ConfigScheduledFtpReport<ConfigFileSuffixXlsx> | undefined;
    'modules.autocomplete.reports.w200': ConfigScheduledFtpReport<ConfigFileSuffixXlsx> | undefined;
};
