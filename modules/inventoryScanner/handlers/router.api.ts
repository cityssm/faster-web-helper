import { Router } from "express";

import handler_exportIssueRecords from "./api-get/exportIssueRecords.js";

export const router = Router()

router.get('/exportIssueRecords', handler_exportIssueRecords)

/*
 * Export the router
 */

export default router
