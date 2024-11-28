import { randomUUID } from 'node:crypto';
import { ADWebAuthAuthenticator, ActiveDirectoryAuthenticator } from '@cityssm/authentication-helper';
import Debug from 'debug';
import { getConfigProperty } from './functions.config.js';
const debug = Debug('faster-web-helper:functions.user');
// eslint-disable-next-line @typescript-eslint/init-declarations
let authenticator;
const authenticationConfig = getConfigProperty('login.authentication');
const domain = getConfigProperty('login.domain');
if (authenticationConfig === undefined) {
    debug('`login.authentication` not defined.');
}
else {
    switch (authenticationConfig.type) {
        case 'activeDirectory': {
            authenticator = new ActiveDirectoryAuthenticator(authenticationConfig.config);
            break;
        }
        case 'adWebAuth': {
            authenticator = new ADWebAuthAuthenticator(authenticationConfig.config);
            break;
        }
        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
        default: {
            debug('Unknown `login.authentication`.');
        }
    }
}
export async function authenticate(userName, password) {
    if (authenticator === undefined) {
        return false;
    }
    return await authenticator.authenticate(`${domain}\\${userName}`, password);
}
export function generateKeyGuid() {
    return randomUUID().replaceAll('-', '');
}
