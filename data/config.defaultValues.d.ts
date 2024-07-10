import type { AccessOptions } from 'basic-ftp';
import type { ConfigFtpPath } from '../types/configTypes.js';
export declare const configDefaultValues: {
    ftp: AccessOptions;
    'modules.inventoryScanner.isEnabled': boolean;
    'modules.inventoryScanner.reports.w200': ConfigFtpPath;
    'modules.inventoryScanner.reports.w311': ConfigFtpPath;
    'modules.inventoryScanner.reports.w604': ConfigFtpPath;
};
