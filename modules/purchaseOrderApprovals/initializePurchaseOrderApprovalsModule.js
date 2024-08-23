import camelCase from 'camelcase';
import Debug from 'debug';
import { getConfigProperty } from '../../helpers/functions.config.js';
import { initializePurchaseOrderApprovalsDatabase } from './database/databaseHelpers.js';
import router from './handlers/router.js';
import { moduleName } from './helpers/moduleHelpers.js';
const debug = Debug(`faster-web-helper:${camelCase(moduleName)}`);
const urlPrefix = getConfigProperty('webServer.urlPrefix');
export default function initializePurchaseOrderApprovalsModule(app) {
    debug(`Initializing "${moduleName}"...`);
    initializePurchaseOrderApprovalsDatabase();
    app.use(`${urlPrefix}/purchaseOrderApprovals`, router);
    debug(`"${moduleName}" initialized.`);
}
