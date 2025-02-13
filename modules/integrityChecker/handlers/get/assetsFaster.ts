import type { Request, Response } from 'express'

import getFasterAssetIntegrityRecords from '../../database/getFasterAssetIntegrityRecords.js'

export default function handler(request: Request, response: Response): void {
  const integrityRecords = getFasterAssetIntegrityRecords()

  response.render('integrityChecker/assetsFaster', {
    headTitle: 'FASTER Web Integrity',
    integrityRecords,
    menu: 'faster'
  })
}
