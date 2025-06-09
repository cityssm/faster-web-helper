import sqlite from 'better-sqlite3';
import { userSettingNames } from '../helpers/userSettings.helpers.js';
import { databasePath } from './helpers.userDatabase.js';
export default function updateUser(userForm, sessionUser) {
    const rightNow = Date.now();
    const database = sqlite(databasePath);
    database
        .prepare(`update Users
        set fasterWebUserName = ?,
          emailAddress = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where userName = ?
          and recordDelete_timeMillis is null`)
        .run(userForm.fasterWebUserName, userForm.emailAddress, sessionUser.userName, rightNow, userForm.userName);
    database
        .prepare('delete from UserSettings where userName = ?')
        .run(userForm.userName);
    for (const settingName of userSettingNames) {
        const settingValue = userForm[settingName];
        if (settingValue === '') {
            continue;
        }
        database
            .prepare(`insert into UserSettings (userName, propertyName, propertyValue)
        values (?, ?, ?)`)
            .run(userForm.userName, settingName, settingValue);
    }
    database.close();
    return true;
}
