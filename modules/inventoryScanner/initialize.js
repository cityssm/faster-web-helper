import { fork } from 'node:child_process';
import { isLocal } from '@cityssm/is-private-network-address';
import camelCase from 'camelcase';
import Debug from 'debug';
import exitHook from 'exit-hook';
import { getConfigProperty } from '../../helpers/functions.config.js';
import { initializeInventoryScannerDatabase } from './database/helpers.database.js';
import router from './handlers/router.js';
import scannerRouter from './handlers/router.scanner.js';
import { hasFasterApi } from './helpers/faster.js';
import { moduleName } from './helpers/module.js';
const debug = Debug(`faster-web-helper:${camelCase(moduleName)}`);
const urlPrefix = getConfigProperty('webServer.urlPrefix');
export default function initializeInventoryScannerModules(options) {
    debug(`Initializing "${moduleName}"...`);
    /*
     * Ensure the local database is available.
     */
    initializeInventoryScannerDatabase();
    /*
     * Initialize validation tasks
     */
    const validationProcesses = [];
    const itemValidationConfig = getConfigProperty('modules.inventoryScanner.items.validation');
    if (itemValidationConfig !== undefined) {
        let itemValidationTaskPath = '';
        if (itemValidationConfig.source === 'dynamicsGP') {
            itemValidationTaskPath =
                './modules/inventoryScanner/tasks/itemValidation/dynamicsGp.js';
        }
        else {
            debug(`Item validation not implemented: ${itemValidationConfig.source}`);
        }
        if (itemValidationTaskPath !== '') {
            validationProcesses.push(fork(itemValidationTaskPath));
        }
    }
    const workOrderValidationSources = getConfigProperty('modules.inventoryScanner.workOrders.validationSources');
    for (const workOrderValidationSource of workOrderValidationSources) {
        let workOrderValidationTaskPath = '';
        if (workOrderValidationSource === 'fasterApi') {
            if (hasFasterApi) {
                workOrderValidationTaskPath =
                    './modules/inventoryScanner/tasks/workOrderValidation/fasterApi.js';
            }
            else {
                debug('Optional "@cityssm/faster-api" package is required for work order validation by FASTER API.');
            }
        }
        else {
            debug(`Work order validation not implemented: ${workOrderValidationSource}`);
        }
        if (workOrderValidationTaskPath !== '') {
            validationProcesses.push(fork(workOrderValidationTaskPath));
        }
    }
    validationProcesses.push(fork('./modules/inventoryScanner/tasks/inventoryScanner/updateRecordsFromValidation.js'));
    /*
     * Initialize router for admin interface
     */
    options.app.use(`${urlPrefix}/modules/inventoryScanner`, (request, response, nextFunction) => {
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
    options.app.use(`${urlPrefix}/apps/inventoryScanner`, (request, response, nextFunction) => {
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
     * Set up exit hook
     */
    exitHook(() => {
        for (const validationProcess of validationProcesses) {
            validationProcess.kill();
        }
    });
    debug(`"${moduleName}" initialized.`);
}
