import { Configurator } from '@cityssm/configurator';
import { DEFAULT_NTFY_SERVER } from '@cityssm/ntfy-publish';
import { configDefaultValues } from '../data/config.defaultValues.js';
import { config } from '../data/config.js';
const configurator = new Configurator(configDefaultValues, config);
export function getConfigProperty(propertyName, fallbackValue) {
    return configurator.getConfigProperty(propertyName, fallbackValue);
}
export const ntfyServerIsDefault = getConfigProperty('ntfy.server') === DEFAULT_NTFY_SERVER;
export default {
    getConfigProperty,
    ntfyServerIsDefault
};
