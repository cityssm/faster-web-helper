import { type ChildProcess, fork } from 'node:child_process'

import camelCase from 'camelcase'
import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { hasFasterApi } from '../../helpers/fasterWeb.helpers.js'
import type { TaskName } from '../../types/tasks.types.js'

import { initializeWorktechIntegrityDatabase } from './database/helpers.database.js'
import { moduleName } from './helpers/module.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:${camelCase(moduleName)}`)

export default function initializeWorktechUpdateTasks(): Partial<
  Record<TaskName, ChildProcess>
> {
  debug(`Initializing "${moduleName}"...`)

  initializeWorktechIntegrityDatabase()

  if (getConfigProperty('worktech') === undefined) {
    debug(
      'WorkTech configuration is not set up. Skipping module initialization.'
    )
    return {}
  }

  const childProcesses: Partial<Record<TaskName, ChildProcess>> = {}

  /*
   * Equipment
   */

  // eslint-disable-next-line no-secrets/no-secrets
  if (getConfigProperty('modules.worktechIntegrity.equipment.isEnabled')) {
    if (hasFasterApi) {
      const taskPath = './modules/worktechIntegrity/tasks/equipment.task.js'
      childProcesses['worktechIntegrity.equipment'] = fork(taskPath)
    } else {
      debug(
        'Optional "@cityssm/faster-api" package is required for equipment integrity checks.'
      )
    }
  }

  debug(`"${moduleName}" initialized.`)

  return childProcesses
}
