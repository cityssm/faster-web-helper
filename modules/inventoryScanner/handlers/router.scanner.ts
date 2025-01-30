import { Router } from 'express'

import handler_scanner from './get-scanner/scanner.js'
import handler_doCreateScannerRecord from './post-scanner/doCreateScannerRecord.js'
import handler_doDeleteScannerRecord from './post-scanner/doDeleteScannerRecord.js'
import handler_doGetItemDescription from './post-scanner/doGetItemDescription.js'
import handler_doGetRepairRecords from './post-scanner/doGetRepairRecords.js'
import handler_doGetScannerRecords from './post-scanner/doGetScannerRecords.js'

export const router = Router()

router.get('/', handler_scanner)

router.post('/doGetRepairRecords', handler_doGetRepairRecords)

router.post('/doGetItemDescription', handler_doGetItemDescription)

router.post('/doCreateScannerRecord', handler_doCreateScannerRecord)

router.post('/doDeleteScannerRecord', handler_doDeleteScannerRecord)

router.post('/doGetScannerRecords', handler_doGetScannerRecords)

export default router
