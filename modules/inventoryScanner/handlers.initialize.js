import { isLocal } from '@cityssm/is-private-network-address';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import apiRouter from './handlers/router.api.js';
import router from './handlers/router.js';
import scannerRouter from './handlers/router.scanner.js';
const urlPrefix = getConfigProperty('webServer.urlPrefix');
export default function initializeInventoryScannerAppHandlers(app) {
    /*
     * Initialize router for admin interface
     */
    app.use(`${urlPrefix}/modules/inventoryScanner`, (request, response, nextFunction) => {
        if ((request.session.user?.settings.inventoryScanner_hasAccess ??
            'false') === 'true') {
            nextFunction();
            return;
        }
        response.redirect(`${urlPrefix}/dashboard`);
    }, router);
    /*
     * Initialize router for scanner
     */
    app.use(`${urlPrefix}/apps/inventoryScanner`, (request, response, nextFunction) => {
        const requestIp = request.ip ?? '';
        const requestIpRegex = getConfigProperty('modules.inventoryScanner.scannerIpAddressRegex');
        if (isLocal(requestIp) || requestIpRegex.test(requestIp)) {
            nextFunction();
            return;
        }
        response.json({
            error: 403,
            requestIp
        });
    }, scannerRouter);
    /*
     * Initialize router for api
     */
    app.use(`${urlPrefix}/api/inventoryScanner`, (request, response, nextFunction) => {
        const requestIp = request.ip ?? '';
        const requestIpRegex = getConfigProperty('modules.inventoryScanner.apiIpAddressRegex');
        if (isLocal(requestIp) || requestIpRegex.test(requestIp)) {
            nextFunction();
            return;
        }
        response.json({
            error: 403,
            requestIp
        });
    }, apiRouter);
}
