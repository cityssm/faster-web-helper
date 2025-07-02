import type { Request, Response } from 'express';
export default function handler(request: Request<{
    batchId: string;
}>, response: Response): void;
