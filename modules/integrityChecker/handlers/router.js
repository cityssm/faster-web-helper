import { Router } from 'express';
import handler_worktech from './get/worktech.js';
export const router = Router();
router.get('/worktech', handler_worktech);
export default router;
