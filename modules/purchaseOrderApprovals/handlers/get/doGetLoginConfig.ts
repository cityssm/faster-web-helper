import type { Request, Response } from 'express'

import { getConfigProperty } from '../../../../helpers/functions.config.js'

export default function handler(request: Request, response: Response): void {
  response.json({
    domain: getConfigProperty('modules.purchaseOrderApprovals.domain')
  })
}
