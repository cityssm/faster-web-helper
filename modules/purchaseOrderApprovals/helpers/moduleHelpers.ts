import { randomUUID } from 'node:crypto'

export const moduleName = 'Purchase Order Approvals Module'

export function getKeyGuid(): string {
  return randomUUID().replaceAll('-', '')
}
