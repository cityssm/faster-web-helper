import sqlite from 'better-sqlite3'

import type { PurchaseOrderApprovalUser } from '../types/recordTypes.js'

import { databasePath } from './databaseHelpers.js'

function getUserByField(
  userDataField: 'userName' | 'userKeyGuid',
  userDataValue: string
): PurchaseOrderApprovalUser | undefined {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const user = database
    .prepare(
      `select userName, fasterWebUserName, emailAddress, approvalMax,
        parentUserName, backupUserName,
        userKeyGuid
        from Users
        where isActive = 1
        and ${userDataField} = ?`
    )
    .get(userDataValue) as PurchaseOrderApprovalUser | undefined

  database.close()

  return user
}

export function getUserByUserName(
  userName: string
): PurchaseOrderApprovalUser | undefined {
  return getUserByField('userName', userName)
}

export function getUserByUserKeyGuid(
  userKeyGuid: string
): PurchaseOrderApprovalUser | undefined {
  return getUserByField('userKeyGuid', userKeyGuid)
}
