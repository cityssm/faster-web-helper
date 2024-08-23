import type { Request, Response } from 'express'

import getPurchaseOrder from '../../database/getPurchaseOrder.js'

export default function handler(request: Request, response: Response): void {
  const tenant = (request.body.tenant ?? '') as string
  const orderNumber = (request.body.orderNumber ?? '') as string

  const purchaseOrder = getPurchaseOrder(tenant, orderNumber)

  response.json({
    isLoggedIn: true,
    purchaseOrder
  })
}
