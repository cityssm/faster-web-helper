import { hoursToMillis } from '@cityssm/to-millis';
export const configDefaultValues = {
    ftp: undefined,
    'webServer.httpPort': 8080,
    'webServer.urlPrefix': '',
    worktech: undefined,
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
    'modules.inventoryScanner.reports.w200': undefined,
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
    'modules.tempFolderCleanup.maxAgeDays': 35,
    /*
     * Purchase Order Approvals
     */
    'modules.purchaseOrderApprovals.isEnabled': false,
    'modules.purchaseOrderApprovals.runOnStartup': true,
    'modules.purchaseOrderApprovals.session.cookieName': 'faster-web-helper-user-sid',
    'modules.purchaseOrderApprovals.session.secret': 'cityssm/faster-web-helper',
    'modules.purchaseOrderApprovals.session.maxAgeMillis': hoursToMillis(12),
    'modules.purchaseOrderApprovals.domain': '',
    'modules.purchaseOrderApprovals.authentication': undefined
};
