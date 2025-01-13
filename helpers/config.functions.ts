import { Configurator } from '@cityssm/configurator'
import { DEFAULT_NTFY_SERVER } from '@cityssm/ntfy-publish'

import { configDefaultValues } from '../data/config.defaultValues.js'
import { config } from '../data/config.js'

const configurator = new Configurator(
  configDefaultValues,
  config as unknown as Record<string, unknown>
)

export function getConfigProperty<K extends keyof typeof configDefaultValues>(
  propertyName: K,
  fallbackValue?: (typeof configDefaultValues)[K]
): (typeof configDefaultValues)[K] {
  return configurator.getConfigProperty(
    propertyName,
    fallbackValue
  ) as (typeof configDefaultValues)[K]
}

export const ntfyServerIsDefault = getConfigProperty('ntfy.server') === DEFAULT_NTFY_SERVER