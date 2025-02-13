import { Router } from 'express';
import handler_assetsFaster from './get/assetsFaster.js';
import handler_assetsWorktech from './get/assetsWorktech.js';
export const router = Router();
router.get('/assetsFaster', handler_assetsFaster);
router.get('/assetsWorktech', handler_assetsWorktech);
export default router;
