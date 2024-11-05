import sqlite from 'better-sqlite3';
import { databasePath } from './userDatabaseHelpers.js';
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
        user.settings = {};
        const userSettings = database
            .prepare(`select propertyName, propertyValue
          from UserSettings
          where userName = ?`)
            .all(user.userName);
        for (const setting of userSettings) {
            user.settings[setting.propertyName] = setting.propertyValue;
        }
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
