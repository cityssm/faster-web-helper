import { type NtfyMessageOptions } from '@cityssm/ntfy-publish';
type PartialNtfyMessageOptions = Pick<NtfyMessageOptions, 'topic' | 'message' | 'clickURL'>;
export declare function sendNtfyMessage(messageOptions: PartialNtfyMessageOptions): Promise<boolean>;
export {};
