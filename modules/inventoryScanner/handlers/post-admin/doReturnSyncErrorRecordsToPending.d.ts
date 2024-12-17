import type { Request, Response } from 'express';
interface DoReturnSyncErrorRecordsForm {
    recordIds: string[];
}
export default function handler(request: Request<unknown, unknown, DoReturnSyncErrorRecordsForm>, response: Response): void;
export {};
