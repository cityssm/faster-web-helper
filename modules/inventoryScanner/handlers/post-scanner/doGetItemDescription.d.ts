import type { Request, Response } from 'express';
interface DoGetItemDescriptionForm {
    itemNumber: string;
}
interface DoGetItemDescriptionReturn {
    itemDescription: string;
    unitPrice?: number;
}
export default function handler(request: Request<unknown, unknown, DoGetItemDescriptionForm>, response: Response<DoGetItemDescriptionReturn>): void;
export {};
