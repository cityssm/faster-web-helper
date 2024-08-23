import sqlite from 'better-sqlite3';
import { getKeyGuid } from '../helpers/moduleHelpers.js';
import { databasePath } from './databaseHelpers.js';
export default function createUser(user) {
    const database = sqlite(databasePath);
    const userRecord = database
        .prepare(`select isActive
        from Users
        where userName = ?`)
        .get(user.userName);
    if (userRecord === undefined) {
        database
            .prepare(`insert into Users
          (userName, fasterWebUserName, emailAddress, approvalMax, userKeyGuid, parentUserName, backupUserName, isAdmin, isActive)
          values (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(user.userName, user.fasterWebUserName, user.emailAddress, user.approvalMax ?? 0, user.userKeyGuid ?? getKeyGuid(), user.parentUserName, user.backupUserName, user.isAdmin ?? 0, 1);
    }
    else if (!userRecord.isActive) {
        database
            .prepare(`update Users
          set fasterWebUserName = ?,
          emailAddress = ?,
          approvalMax = ?,
          userKeyGuid = ?,
          parentUserName = ?,
          backupUserName = ?,
          isAdmin = ?,
          isActive = ?
          where userName = ?`)
            .run(user.fasterWebUserName, user.emailAddress, user.approvalMax ?? 0, user.userKeyGuid ?? getKeyGuid(), user.parentUserName, user.backupUserName, user.isAdmin ?? 0, 1, user.userName);
    }
    database.close();
    return true;
}
