import sqlite from 'better-sqlite3';
import { getUserSettings } from './getUserSettings.js';
import { databasePath } from './helpers.userDatabase.js';
function getUserByField(userDataField, userDataValue) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const user = database
        .prepare(`select userName, fasterWebUserName, emailAddress, userKeyGuid
        from Users
        where recordDelete_timeMillis is null
        and ${userDataField} = ?`)
        .get(userDataValue);
    if (user !== undefined) {
        user.settings = getUserSettings(user.userName, database);
    }
    database.close();
    return user;
}
export function getUserByUserName(userName) {
    return getUserByField('userName', userName);
}
export function getUserByUserKeyGuid(userKeyGuid) {
    return getUserByField('userKeyGuid', userKeyGuid);
}
