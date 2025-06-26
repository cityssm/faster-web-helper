import type { Request, Response } from 'express';
export default function handler(request: Request<unknown, unknown, {
    batchId: number | string;
}>, response: Response): void;
