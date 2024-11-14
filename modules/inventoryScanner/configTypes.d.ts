import type { GPItemWithQuantity } from '@cityssm/dynamics-gp';
import type { Spec } from 'node-schedule';
import type { ConfigFileSuffixXlsx, ConfigScheduledFtpReport } from '../../types/configHelperTypes.js';
export interface ConfigItemValidationDynamicsGP {
    source: 'dynamicsGP';
    schedule?: Spec;
    gpLocationCodesToFasterStorerooms: Record<string, string>;
    gpItemFilter?: (item: GPItemWithQuantity) => boolean;
}
export interface ConfigItemValidationFaster {
    source: 'faster';
    /** W200 - Inventory Report */
    w200?: ConfigScheduledFtpReport<ConfigFileSuffixXlsx>;
}
export interface ConfigModuleInventoryScanner {
    scannerIpAddressRegex?: RegExp;
    workOrders?: {
        acceptNotValidated?: boolean;
        fasterRegex?: RegExp;
        acceptWorkTech?: boolean;
        workTechRegex?: RegExp;
    };
    items?: {
        acceptNotValidated?: boolean;
        itemNumberRegex?: RegExp;
        validation?: ConfigItemValidationDynamicsGP | ConfigItemValidationFaster;
    };
    quantities?: {
        acceptOverages?: boolean;
        acceptNegatives?: boolean;
    };
    reports?: {
        /**
         * W311 - Active Work Orders by Shop
         */
        w311?: ConfigScheduledFtpReport<ConfigFileSuffixXlsx>;
        /**
         * W604 - Integration Log Viewer
         */
        w604?: ConfigScheduledFtpReport<ConfigFileSuffixXlsx>;
    };
}
