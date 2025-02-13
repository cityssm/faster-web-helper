import type { Request, Response } from 'express'

import getWorktechEquipmentIntegrityRecords from '../../database/getWorktechEquipmentIntegrityRecords.js'

export default function handler(request: Request, response: Response): void {

  const integrityRecords = getWorktechEquipmentIntegrityRecords()

  response.render('integrityChecker/assetsWorktech', {
    headTitle: 'WorkTech Integrity',
    integrityRecords,
    menu: 'worktech'
  })
}
