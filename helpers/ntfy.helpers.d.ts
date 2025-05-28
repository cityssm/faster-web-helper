import { type NtfyMessageOptions } from '@cityssm/ntfy-publish';
type PartialNtfyMessageOptions = Pick<NtfyMessageOptions, 'clickURL' | 'message' | 'topic'>;
export declare function sendNtfyMessage(messageOptions: PartialNtfyMessageOptions): Promise<boolean>;
export {};
