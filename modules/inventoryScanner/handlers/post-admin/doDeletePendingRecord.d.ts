import type { Request, Response } from 'express';
interface DoDeletePendingRecordForm {
    recordId: string;
}
export default function handler(request: Request<unknown, unknown, DoDeletePendingRecordForm>, response: Response): void;
export {};
