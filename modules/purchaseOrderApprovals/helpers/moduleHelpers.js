import { randomUUID } from 'node:crypto';
export const moduleName = 'Purchase Order Approvals Module';
export function getKeyGuid() {
    return randomUUID().replaceAll('-', '');
}
