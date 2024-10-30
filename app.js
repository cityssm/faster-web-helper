import http from 'node:http';
import path from 'node:path';
import { secondsToMillis } from '@cityssm/to-millis';
import cookieParser from 'cookie-parser';
import Debug from 'debug';
import { asyncExitHook } from 'exit-hook';
import express from 'express';
import schedule from 'node-schedule';
import { getConfigProperty } from './helpers/functions.config.js';
const debug = Debug('faster-web-helper:app');
/*
 * Initialize app
 */
const app = express();
app.set('views', path.join('views'));
app.set('view engine', 'ejs');
app.use((request, _response, next) => {
    debug(`${request.method} ${request.url}`);
    next();
});
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
/*
 * Initialize modules
 */
const options = {
    app
};
if (getConfigProperty('modules.autocomplete.isEnabled')) {
    const initializeAutocompleteModule = await import('./modules/autocomplete/initializeAutocompleteModule.js');
    await initializeAutocompleteModule.default(options);
}
if (getConfigProperty('modules.inventoryScanner.isEnabled')) {
    debug('Initializing Inventory Scanner');
}
if (getConfigProperty('modules.worktechUpdate.isEnabled')) {
    const initializeWorktechUpdateModule = await import('./modules/worktechUpdate/initializeWorktechUpdateModule.js');
    await initializeWorktechUpdateModule.default(options);
}
if (getConfigProperty('modules.tempFolderCleanup.isEnabled')) {
    const initializeTempFolderCleanupModule = await import('./modules/tempFolderCleanup/initializeTempFolderCleanupModule.js');
    await initializeTempFolderCleanupModule.default(options);
}
if (getConfigProperty('modules.purchaseOrderApprovals.isEnabled')) {
    const initializePurchaseOrderApprovalsModule = await import('./modules/purchaseOrderApprovals/initializePurchaseOrderApprovalsModule.js');
    initializePurchaseOrderApprovalsModule.default(options);
}
/*
 * Initialize server
 */
const httpPort = getConfigProperty('webServer.httpPort');
// eslint-disable-next-line @typescript-eslint/no-misused-promises, sonarjs/no-misused-promises
const httpServer = http.createServer(app);
httpServer.listen(httpPort);
debug(`HTTP listening on ${httpPort.toString()}`);
asyncExitHook(async () => {
    await schedule.gracefulShutdown();
    httpServer.close();
}, {
    wait: secondsToMillis(1)
});
