// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @cspell/spellchecker */
import { Router } from 'express';
import createUser from '../database/createUser.js';
import { getUserByUserName } from '../database/getUser.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import { authenticate } from '../helpers/users.helpers.js';
export const router = Router();
function getSafeRedirectURL(possibleRedirectURL = '') {
    const urlPrefix = getConfigProperty('webServer.urlPrefix');
    const urlToCheck = (possibleRedirectURL.startsWith(urlPrefix)
        ? possibleRedirectURL.slice(urlPrefix.length)
        : possibleRedirectURL).toLowerCase();
    switch (urlToCheck) {
        case '/dashboard':
        case '/modules/inventoryscanner': {
            return urlPrefix + urlToCheck;
        }
    }
    return `${urlPrefix}/dashboard`;
}
router
    .route('/')
    .get((request, response) => {
    const sessionCookieName = getConfigProperty('webServer.session.cookieName');
    if (request.session.user !== undefined && request.cookies[sessionCookieName] !== undefined) {
        const redirectURL = getSafeRedirectURL((request.query.redirect ?? ''));
        response.redirect(redirectURL);
    }
    else {
        response.render('login', {
            userName: '',
            message: '',
            redirect: request.query.redirect
        });
    }
})
    .post(async (request, response) => {
    const userName = (request.body.userName ?? '').toLowerCase();
    const password = (request.body.password ?? '');
    const redirectURL = getSafeRedirectURL((request.body.redirect ?? ''));
    const isAuthenticated = await authenticate(userName, password);
    let sessionHasUser = false;
    if (isAuthenticated) {
        let user = getUserByUserName(userName);
        if (user === undefined) {
            createUser({
                userName
            });
            user = getUserByUserName(userName);
        }
        if (user !== undefined) {
            request.session.user = user;
            sessionHasUser = true;
        }
    }
    if (sessionHasUser) {
        response.redirect(redirectURL);
    }
    else {
        response.render('login', {
            userName,
            message: 'Login Failed',
            redirect: redirectURL
        });
    }
});
export default router;
