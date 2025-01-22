import { Router } from 'express';
import handler_worktechIntegrity from './get/index.js';
export const router = Router();
router.get('/', handler_worktechIntegrity);
export default router;
