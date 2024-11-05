import camelCase from 'camelcase';
import Debug from 'debug';
import { getConfigProperty } from '../../helpers/functions.config.js';
import { initializeInventoryScannerDatabase } from './database/databaseHelpers.js';
import { moduleName } from './helpers/moduleHelpers.js';
import router from './inventoryScannerRouter.js';
const debug = Debug(`faster-web-helper:${camelCase(moduleName)}`);
const urlPrefix = getConfigProperty('webServer.urlPrefix');
export default function initializeInventoryScannerModules(options) {
    debug(`Initializing "${moduleName}"...`);
    /*
     * Ensure the local database is available.
     */
    initializeInventoryScannerDatabase();
    options.app.use(`${urlPrefix}/modules/inventoryScanner`, (request, response, nextFunction) => {
        if ((request.session.user?.settings.inventoryScanner_hasAccess ??
            'false') === 'true') {
            nextFunction();
            return;
        }
        response.redirect(`${urlPrefix}/dashboard`);
    }, router);
}
