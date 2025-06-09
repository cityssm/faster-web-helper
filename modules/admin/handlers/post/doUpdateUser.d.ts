import type { Request, Response } from 'express';
import { type DoUpdateUserForm } from '../../../../database/updateUser.js';
export default function handler(request: Request<unknown, unknown, DoUpdateUserForm>, response: Response): void;
