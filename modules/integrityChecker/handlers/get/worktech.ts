import type { Request, Response } from 'express'

import { getAssetIntegrityRecords } from '../../database/getAssetIntegrityRecords.js'

export default function handler(request: Request, response: Response): void {

  const assetIntegrityRecords = getAssetIntegrityRecords()

  response.render('integrityChecker/worktech', {
    headTitle: 'WorkTech Integrity',
    assetIntegrityRecords
  })
}
