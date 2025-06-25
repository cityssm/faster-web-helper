import type { Request, Response } from 'express';
interface DoGetRepairIdsForm {
    workOrderNumber: string;
}
export default function handler(request: Request<unknown, unknown, DoGetRepairIdsForm>, response: Response): void;
export {};
