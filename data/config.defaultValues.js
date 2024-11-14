import { hoursToMillis } from '@cityssm/to-millis';
export const configDefaultValues = {
    ftp: undefined,
    'webServer.httpPort': 8080,
    'webServer.urlPrefix': '',
    'webServer.session.cookieName': 'faster-web-helper-user-sid',
    'webServer.session.secret': 'cityssm/faster-web-helper',
    'webServer.session.maxAgeMillis': hoursToMillis(12),
    'login.domain': '',
    'login.authentication': undefined,
    worktech: undefined,
    dynamicsGP: undefined,
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
    'modules.inventoryScanner.isEnabled': false,
    'modules.inventoryScanner.runOnStartup': true,
    'modules.inventoryScanner.scannerIpAddressRegex': /^$/,
    'modules.inventoryScanner.workOrders.acceptNotValidated': true,
    'modules.inventoryScanner.workOrders.fasterRegex': /^\d+/,
    // eslint-disable-next-line no-secrets/no-secrets
    'modules.inventoryScanner.workOrders.acceptWorkTech': false,
    // eslint-disable-next-line no-secrets/no-secrets
    'modules.inventoryScanner.workOrders.workTechRegex': /^[A-Z]{2}.\d{2}.\d{5}$/,
    'modules.inventoryScanner.items.acceptNotValidated': true,
    'modules.inventoryScanner.items.itemNumberRegex': undefined,
    'modules.inventoryScanner.items.validation': undefined,
    'modules.inventoryScanner.quantities.acceptOverages': true,
    'modules.inventoryScanner.quantities.acceptNegatives': true,
    'modules.inventoryScanner.reports.w311': undefined,
    'modules.inventoryScanner.reports.w604': undefined,
    /*
     * Worktech Update
     */
    'modules.worktechUpdate.isEnabled': false,
    'modules.worktechUpdate.runOnStartup': true,
    'modules.worktechUpdate.resourceItem.itemClass': 'FASTER',
    'modules.worktechUpdate.resourceItem.itemType': 'FASTER',
    'modules.worktechUpdate.resourceItem.unit': 'EA',
    'modules.worktechUpdate.reports.w114': undefined,
    'modules.worktechUpdate.reports.w217': undefined,
    'modules.worktechUpdate.reports.w223': undefined,
    /*
     * Temp Folder Cleanup
     */
    'modules.tempFolderCleanup.isEnabled': true,
    'modules.tempFolderCleanup.runOnStartup': false,
    'modules.tempFolderCleanup.schedule': {
        dayOfWeek: 0,
        hour: 1
    },
    'modules.tempFolderCleanup.maxAgeDays': 35
};
