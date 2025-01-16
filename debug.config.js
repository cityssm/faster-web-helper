import { DEBUG_ENABLE_NAMESPACES as DEBUG_ENABLE_NAMESPACES_DYNAMICS } from '@cityssm/dynamics-gp/debug';
import { DEBUG_ENABLE_NAMESPACES as DEBUG_ENABLE_NAMESPACES_FASTER_REPORT_EXPORTER } from '@cityssm/faster-report-exporter/debug';
import { DEBUG_ENABLE_NAMESPACES as DEBUG_ENABLE_NAMESPACES_FASTER_REPORT_PARSER } from '@cityssm/faster-report-parser/debug';
import { DEBUG_ENABLE_NAMESPACES as DEBUG_ENABLE_NAMESPACES_FASTER_UNOFFICIAL } from '@cityssm/faster-unofficial-api/debug';
import { DEBUG_ENABLE_NAMESPACES as DEBUG_ENABLE_NAMESPACES_MSSQL } from '@cityssm/mssql-multi-pool/debug';
import { DEBUG_ENABLE_NAMESPACES as DEBUG_ENABLE_NAMESPACES_WORKTECH } from '@cityssm/worktech-api/debug';
import { hasFasterApi } from './helpers/fasterWeb.helpers.js';
export const DEBUG_NAMESPACE = 'faster-web-helper';
const DEBUG_ENABLE_NAMESPACES_LIST = [
    `${DEBUG_NAMESPACE}:*`,
    DEBUG_ENABLE_NAMESPACES_DYNAMICS,
    DEBUG_ENABLE_NAMESPACES_FASTER_REPORT_EXPORTER,
    DEBUG_ENABLE_NAMESPACES_FASTER_REPORT_PARSER,
    DEBUG_ENABLE_NAMESPACES_FASTER_UNOFFICIAL,
    DEBUG_ENABLE_NAMESPACES_WORKTECH,
    DEBUG_ENABLE_NAMESPACES_MSSQL
];
if (hasFasterApi) {
    const fasterApiDebug = await import('@cityssm/faster-api/debug');
    DEBUG_ENABLE_NAMESPACES_LIST.push(fasterApiDebug.DEBUG_ENABLE_NAMESPACES);
}
export const DEBUG_ENABLE_NAMESPACES = DEBUG_ENABLE_NAMESPACES_LIST.join(',');
