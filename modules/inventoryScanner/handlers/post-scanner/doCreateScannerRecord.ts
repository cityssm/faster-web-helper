import type { Request, Response } from 'express'

import createScannerRecord from '../../database/createScannerRecord.js'

export default function handler(request: Request, response: Response): void {
  const success = createScannerRecord(request.body)

  response.json({ success })
}
