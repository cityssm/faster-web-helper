import camelcase from 'camelcase';
import Debug from 'debug';
import express from 'express';
import session from 'express-session';
import FileStore from 'session-file-store';
import { getConfigProperty } from '../../../helpers/functions.config.js';
import { moduleName } from '../helpers/moduleHelpers.js';
import handler_doGetLoginConfig from './get/doGetLoginConfig.js';
import handler_doCreatePurchaseOrder from './post/doCreatePurchaseOrder.js';
import handler_doGetPurchaseOrder from './post/doGetPurchaseOrder.js';
import handler_doLogin from './post/doLogin.js';
import handler_doValidateUserKeyGuid from './post/doValidateUserKeyGuid.js';
const debug = Debug(`faster-web-helper:${camelcase(moduleName)}:router`);
export const router = express.Router();
/*
 * SESSION MANAGEMENT
 */
const sessionCookieName = 'faster-web-helper-purchase-order-approvals-session';
const FileStoreSession = FileStore(session);
// Initialize session
router.use(session({
    store: new FileStoreSession({
        path: './data/sessions',
        logFn: debug,
        retries: 20
    }),
    name: sessionCookieName,
    secret: getConfigProperty('modules.purchaseOrderApprovals.session.secret'),
    resave: true,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: getConfigProperty('modules.purchaseOrderApprovals.session.maxAgeMillis'),
        sameSite: 'strict'
    }
}));
// Redirect logged in users
function sessionChecker(request, response, next) {
    if (request.session.purchaseOrderApprovalUser !== undefined &&
        request.cookies[sessionCookieName]) {
        next();
        return;
    }
    response.json({ isLoggedIn: false });
}
router.get('/doGetLoginConfig', handler_doGetLoginConfig);
router.post('/doLogin', handler_doLogin);
router.post('/doValidateUserKeyGuid', handler_doValidateUserKeyGuid);
router.post('/doGetPurchaseOrder', sessionChecker, handler_doGetPurchaseOrder);
router.post('/doCreatePurchaseOrder', sessionChecker, handler_doCreatePurchaseOrder);
export default router;
