import { DEBUG_ENABLE_NAMESPACES as DEBUG_ENABLE_NAMESPACES_DYNAMICS } from '@cityssm/dynamics-gp/debug'
import { DEBUG_ENABLE_NAMESPACES as DEBUG_ENABLE_NAMESPACES_FASTER_REPORT_EXPORTER } from '@cityssm/faster-report-exporter/debug'
import { DEBUG_ENABLE_NAMESPACES as DEBUG_ENABLE_NAMESPACES_FASTER_REPORT_PARSER } from '@cityssm/faster-report-parser/debug'
import { DEBUG_ENABLE_NAMESPACES as DEBUG_ENABLE_NAMESPACES_MSSQL } from '@cityssm/mssql-multi-pool/debug'
import { DEBUG_ENABLE_NAMESPACES as DEBUG_ENABLE_NAMESPACES_WORKTECH } from '@cityssm/worktech-api/debug'

export const DEBUG_NAMESPACE = 'faster-web-helper'

export const DEBUG_ENABLE_NAMESPACES = [
  `${DEBUG_NAMESPACE}:*`,
  DEBUG_ENABLE_NAMESPACES_DYNAMICS,
  DEBUG_ENABLE_NAMESPACES_FASTER_REPORT_EXPORTER,
  DEBUG_ENABLE_NAMESPACES_FASTER_REPORT_PARSER,
  DEBUG_ENABLE_NAMESPACES_WORKTECH,
  DEBUG_ENABLE_NAMESPACES_MSSQL
].join(',')
