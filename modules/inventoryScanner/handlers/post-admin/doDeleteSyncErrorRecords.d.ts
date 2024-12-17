import type { Request, Response } from 'express';
interface DoDeleteSyncErrorRecordsForm {
    recordIds: string[];
}
export default function handler(request: Request<unknown, unknown, DoDeleteSyncErrorRecordsForm>, response: Response): void;
export {};
