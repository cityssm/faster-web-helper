import { ADWebAuthAuthenticator, ActiveDirectoryAuthenticator } from '@cityssm/authentication-helper';
import { getConfigProperty } from '../../../helpers/functions.config.js';
// eslint-disable-next-line @typescript-eslint/init-declarations
let authenticator;
const authenticationConfig = getConfigProperty('modules.purchaseOrderApprovals.authentication');
const domain = getConfigProperty('modules.purchaseOrderApprovals.domain');
switch (authenticationConfig?.type) {
    case 'activeDirectory': {
        authenticator = new ActiveDirectoryAuthenticator(authenticationConfig.config);
        break;
    }
    case 'adWebAuth': {
        authenticator = new ADWebAuthAuthenticator(authenticationConfig.config);
        break;
    }
}
export async function authenticate(userName, password) {
    if (authenticator === undefined) {
        return false;
    }
    return await authenticator.authenticate(`${domain}\\${userName}`, password);
}
