import { Router } from 'express';
import handler_scanner from './get-scanner/scanner.js';
import handler_doCreateScannerRecord from './post-scanner/doCreateScannerRecord.js';
import handler_doGetRepairRecords from './post-scanner/doGetRepairRecords.js';
export const router = Router();
router.get('/', handler_scanner);
router.post('/doGetRepairRecords', handler_doGetRepairRecords);
router.post('/doCreateScannerRecord', handler_doCreateScannerRecord);
export default router;
