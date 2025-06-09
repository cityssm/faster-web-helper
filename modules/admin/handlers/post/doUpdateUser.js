import { getUsers } from '../../../../database/getUsers.js';
import updateUser from '../../../../database/updateUser.js';
export default function handler(request, response) {
    const success = updateUser(request.body, request.session.user);
    const users = getUsers();
    response.json({ success, users });
}
