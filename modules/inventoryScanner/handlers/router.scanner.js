import { Router } from 'express';
import handler_scanner from './get-scanner/scanner.js';
export const router = Router();
router.get('/', handler_scanner);
export default router;
