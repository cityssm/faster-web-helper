import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    itemNumber: string;
    itemStoreroom: string;
}>, response: Response): void;
