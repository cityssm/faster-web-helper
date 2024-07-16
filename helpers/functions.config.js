import { Configurator } from '@cityssm/configurator';
import { configDefaultValues } from '../data/config.defaultValues.js';
import { config } from '../data/config.js';
const configurator = new Configurator(configDefaultValues, config);
export function getConfigProperty(propertyName, fallbackValue) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return configurator.getConfigProperty(propertyName, fallbackValue);
}
