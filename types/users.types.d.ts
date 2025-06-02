import type { userSettingNames } from "../helpers/userSettings.helpers.js";
export interface FasterWebHelperUser {
    userName: string;
    fasterWebUserName?: string;
    emailAddress?: string;
    userKeyGuid: string;
    settings: Partial<Record<typeof userSettingNames[number], string | null>>;
}
declare global {
    export type FasterWebHelperSessionUser = FasterWebHelperUser;
}
declare module 'express-session' {
    interface Session {
        user?: FasterWebHelperSessionUser;
    }
}
