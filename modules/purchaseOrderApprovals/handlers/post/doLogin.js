import createUser from '../../database/createUser.js';
import { getUserByUserName } from '../../database/getUser.js';
import { authenticate } from '../../helpers/authenticationHelpers.js';
export default async function handler(request, response) {
    const userName = (request.body.userName ?? '').toLowerCase();
    const password = (request.body.password ?? '');
    const isAuthenticated = await authenticate(userName, password);
    let sessionHasUser = false;
    if (isAuthenticated) {
        let user = getUserByUserName(userName);
        if (user === undefined) {
            createUser({
                userName,
                approvalMax: 0
            });
            user = getUserByUserName(userName);
        }
        if (user !== undefined) {
            request.session.purchaseOrderApprovalUser = {
                userName,
                userKeyGuid: user.userKeyGuid,
                approvalMax: user.approvalMax,
                isAdmin: user.isAdmin
            };
            sessionHasUser = true;
        }
    }
    if (sessionHasUser) {
        response.json({
            isLoggedIn: true,
            userName,
            userKeyGuid: request.session.purchaseOrderApprovalUser?.userKeyGuid
        });
    }
    else {
        response.json({
            isLoggedIn: false
        });
    }
}
