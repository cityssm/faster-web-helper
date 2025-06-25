import type { Request, Response } from 'express';
import type { ItemValidationRecord } from '../../types.js';
export default function handler(request: Request, response: Response<{
    inventory: ItemValidationRecord[];
}>): void;
