import ntfyPublish, { type NtfyMessageOptions } from '@cityssm/ntfy-publish'
import Debug from 'debug'

import { getConfigProperty } from './config.functions.js'

const debug = Debug('faster-web-helper:ntfy.helpers')

const ntfyServer = getConfigProperty('ntfy.server')
const ntfyTitle = 'FASTER Web Helper'

type PartialNtfyMessageOptions = Pick<
  NtfyMessageOptions,
  'topic' | 'message' | 'clickURL'
>

export async function sendNtfyMessage(
  messageOptions: PartialNtfyMessageOptions
): Promise<boolean> {
  if (ntfyServer === '' || messageOptions.topic === '') {
    return false
  }

  try {
    return await ntfyPublish({
      server: ntfyServer,
      title: ntfyTitle,
      ...messageOptions
    })
  } catch (error) {
    debug('Error sending NTFY message:', error)
    return false
  }
}
