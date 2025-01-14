import { getConfigProperty } from '../helpers/config.helpers.js';
const urlPrefix = getConfigProperty('webServer.urlPrefix');
const sessionCookieName = getConfigProperty('webServer.session.cookieName');
// Redirect logged in users
export function sessionCheckHandler(request, response, next) {
    if (request.session.user !== undefined &&
        request.cookies[sessionCookieName] !== undefined) {
        next();
        return;
    }
    response.redirect(`${urlPrefix}/login?redirect=${request.originalUrl}`);
}
