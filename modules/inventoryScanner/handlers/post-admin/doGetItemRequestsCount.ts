import type { Request, Response } from 'express'

import getSetting from '../../database/getSetting.js'

export default function handler(
  request: Request,
  response: Response
): void {
  const itemRequestsCount = Number.parseInt(getSetting('itemRequests.count') ?? '0')

  response.json({ itemRequestsCount })
}
