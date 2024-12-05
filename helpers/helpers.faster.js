import hasPackage from '@cityssm/has-package';
import { getConfigProperty } from './functions.config.js';
const fasterApiPackageExists = await hasPackage('@cityssm/faster-api');
const fasterWebConfig = getConfigProperty('fasterWeb');
export const hasFasterApi = fasterApiPackageExists &&
    fasterWebConfig.apiUserName !== undefined &&
    fasterWebConfig.apiPassword !== undefined;
