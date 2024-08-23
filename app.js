import http from 'node:http';
import path from 'node:path';
import cookieParser from 'cookie-parser';
import Debug from 'debug';
import { asyncExitHook } from 'exit-hook';
import express from 'express';
import schedule from 'node-schedule';
import { getConfigProperty } from './helpers/functions.config.js';
import initializeAutocompleteModule from './modules/autocomplete/initializeAutocompleteModule.js';
import initializePurchaseOrderApprovalsModule from './modules/purchaseOrderApprovals/initializePurchaseOrderApprovalsModule.js';
import initializeTempFolderCleanupModule from './modules/tempFolderCleanup/initializeTempFolderCleanupModule.js';
import initializeWorktechUpdateModule from './modules/worktechUpdate/initializeWorktechUpdateModule.js';
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
if (getConfigProperty('modules.autocomplete.isEnabled')) {
    await initializeAutocompleteModule(app);
}
if (getConfigProperty('modules.inventoryScanner.isEnabled')) {
    debug('Initializing Inventory Scanner');
}
if (getConfigProperty('modules.worktechUpdate.isEnabled')) {
    await initializeWorktechUpdateModule();
}
if (getConfigProperty('modules.tempFolderCleanup.isEnabled')) {
    await initializeTempFolderCleanupModule();
}
if (getConfigProperty('modules.purchaseOrderApprovals.isEnabled')) {
    initializePurchaseOrderApprovalsModule(app);
}
/*
 * Initialize server
 */
const httpPort = getConfigProperty('webServer.httpPort');
const httpServer = http.createServer(app);
httpServer.listen(httpPort);
debug(`HTTP listening on ${httpPort.toString()}`);
asyncExitHook(async () => {
    await schedule.gracefulShutdown();
    httpServer.close();
}, {
    wait: 1000
});
