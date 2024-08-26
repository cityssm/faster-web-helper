export default function getApprovals(database, tenant, orderNumber) {
    return database
        .prepare(`select userName, approvalAmount, isApproved,
        lastUpdatedDate, lastUpdatedTime
        from Approvals
        where tenant = ?
        and orderNumber = ?`)
        .all(tenant, orderNumber);
}
