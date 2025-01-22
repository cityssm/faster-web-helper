export function deleteExpiredRecords(recordTable, recordUpdateTimeMillis, connectedDatabase) {
    const changeCount = connectedDatabase
        .prepare(`delete from ${recordTable}
        where recordUpdate_timeMillis < ?`)
        .run(recordUpdateTimeMillis);
    return changeCount.changes;
}
