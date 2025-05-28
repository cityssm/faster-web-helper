import ntfyPublish, { type NtfyMessageOptions } from '@cityssm/ntfy-publish'
import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../debug.config.js'

import { getConfigProperty } from './config.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:ntfy.helpers`)

const ntfyServer = getConfigProperty('ntfy.server')
const ntfyTitle = 'FASTER Web Helper'

type PartialNtfyMessageOptions = Pick<
  NtfyMessageOptions,
  'clickURL' | 'message' | 'topic'
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
