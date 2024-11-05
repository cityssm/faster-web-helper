import { Router } from 'express';
import handler_dashboard from '../handlers/get/dashboard.js';
export const router = Router();
router.get('/', handler_dashboard);
export default router;
