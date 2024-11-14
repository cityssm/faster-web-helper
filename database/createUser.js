import sqlite from 'better-sqlite3';
import { generateKeyGuid } from '../helpers/functions.user.js';
import { databasePath } from './helpers.userDatabase.js';
export default function createUser(user) {
    const rightNow = Date.now();
    const database = sqlite(databasePath);
    const userRecord = database
        .prepare(`select recordDelete_timeMillis
        from Users
        where userName = ?`)
        .get(user.userName);
    if (userRecord === undefined) {
        database
            .prepare(`insert into Users
          (userName, fasterWebUserName, emailAddress, userKeyGuid,
            recordCreate_userName, recordCreate_timeMillis,
            recordUpdate_userName, recordUpdate_timeMillis)
          values (?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(user.userName, user.fasterWebUserName, user.emailAddress, user.userKeyGuid ?? generateKeyGuid(), user.userName, rightNow, user.userName, rightNow);
    }
    else if (userRecord.recordDelete_timeMillis !== null) {
        database.prepare('delete from UserSettings where userName = ?').run(user.userName);
        database
            .prepare(`update Users
          set fasterWebUserName = ?,
          emailAddress = ?,
          userKeyGuid = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?,
          recordDelete_userName = null,
          recordDelete_timeMillis = null
          where userName = ?`)
            .run(user.fasterWebUserName, user.emailAddress, user.userKeyGuid ?? generateKeyGuid(), user.userName, rightNow, user.userName);
    }
    database.close();
    return true;
}
