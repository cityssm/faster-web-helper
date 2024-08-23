import { getUserByUserKeyGuid } from '../../database/getUser.js';
export default function handler(request, response) {
    const userKeyGuid = (request.body.userKeyGuid ?? '');
    const user = getUserByUserKeyGuid(userKeyGuid);
    if (user === undefined) {
        response.json({
            isLoggedIn: false
        });
    }
    else {
        request.session.purchaseOrderApprovalUser = {
            userName: user.userName,
            userKeyGuid: user.userKeyGuid,
            isAdmin: user.isAdmin
        };
        response.json({
            isLoggedIn: true,
            userName: user.userName,
            userKeyGuid: user.userKeyGuid
        });
    }
}
