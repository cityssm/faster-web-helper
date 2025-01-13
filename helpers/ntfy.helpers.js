import ntfyPublish from '@cityssm/ntfy-publish';
import Debug from 'debug';
import { getConfigProperty } from './config.functions.js';
const debug = Debug('faster-web-helper:ntfy.helpers');
const ntfyServer = getConfigProperty('ntfy.server');
const ntfyTitle = 'FASTER Web Helper';
export async function sendNtfyMessage(messageOptions) {
    if (ntfyServer === '' || messageOptions.topic === '') {
        return false;
    }
    try {
        return await ntfyPublish({
            server: ntfyServer,
            title: ntfyTitle,
            ...messageOptions
        });
    }
    catch (error) {
        debug('Error sending NTFY message:', error);
        return false;
    }
}
