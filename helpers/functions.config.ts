import { Configurator } from '@cityssm/configurator'

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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return configurator.getConfigProperty(
    propertyName,
    fallbackValue
  ) as (typeof configDefaultValues)[K]
}
