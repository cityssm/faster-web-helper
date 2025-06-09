import { userSettingNames } from '../helpers/userSettings.helpers.js';
export type DoUpdateUserForm = Record<(typeof userSettingNames)[number], string> & {
    userName: string;
    emailAddress: string;
    fasterWebUserName: string;
};
export default function updateUser(userForm: DoUpdateUserForm, sessionUser: FasterWebHelperSessionUser): boolean;
