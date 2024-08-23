import sqlite from 'better-sqlite3';
import { databasePath } from './databaseHelpers.js';
function getUserByField(userDataField, userDataValue) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const user = database
        .prepare(`select userName, fasterWebUserName, emailAddress, approvalMax,
        parentUserName, backupUserName,
        userKeyGuid
        from Users
        where isActive = 1
        and ${userDataField} = ?`)
        .get(userDataValue);
    database.close();
    return user;
}
export function getUserByUserName(userName) {
    return getUserByField('userName', userName);
}
export function getUserByUserKeyGuid(userKeyGuid) {
    return getUserByField('userKeyGuid', userKeyGuid);
}
