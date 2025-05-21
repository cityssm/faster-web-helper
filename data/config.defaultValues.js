// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { hoursToMillis } from '@cityssm/to-millis';
import integrityCheckerDefaultValues from '../modules/integrityChecker/config/defaultValues.js';
import inventoryScannerDefaultValues from '../modules/inventoryScanner/config/defaultValues.js';
export const configDefaultValues = {
    'application.workDays': [1, 2, 3, 4, 5],
    'application.workHours': [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    ftp: undefined,
    'webServer.httpPort': 8080,
    'webServer.urlPrefix': '',
    'webServer.session.cookieName': 'faster-web-helper-user-sid',
    'webServer.session.secret': 'cityssm/faster-web-helper',
    'webServer.session.maxAgeMillis': hoursToMillis(12),
    'login.domain': '',
    'login.authentication': undefined,
    fasterWeb: { tenantOrBaseUrl: '' },
    worktech: undefined,
    dynamicsGP: undefined,
    'ntfy.server': '',
    /*
     * Autocomplete
     */
    'modules.autocomplete.isEnabled': false,
    'modules.autocomplete.runOnStartup': true,
    'modules.autocomplete.reports.w114': undefined,
    'modules.autocomplete.reports.w200': undefined,
    /*
     * Inventory Scanner
     */
    ...inventoryScannerDefaultValues,
    /*
     * Worktech Update
     */
    ...integrityCheckerDefaultValues,
    /*
     * Temp Folder Cleanup
     */
    'modules.tempFolderCleanup.isEnabled': true,
    'modules.tempFolderCleanup.maxAgeDays': 35,
    'modules.tempFolderCleanup.schedule': {
        dayOfWeek: 0,
        hour: 1,
        minute: 0,
        second: 0
    },
};
