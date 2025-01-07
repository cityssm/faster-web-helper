import { type ChildProcess, fork } from 'node:child_process'

import camelCase from 'camelcase'
import Debug from 'debug'
import exitHook from 'exit-hook'

import { getConfigProperty } from '../../helpers/config.functions.js'
import { hasFasterApi } from '../../helpers/fasterWeb.helpers.js'

import { moduleName } from './helpers/module.helpers.js'

const debug = Debug(`faster-web-helper:${camelCase(moduleName)}`)

export function initializeWorktechUpdateTasks(): void {
  debug(`Initializing "${moduleName}"...`)

  if (getConfigProperty('worktech') === undefined) {
    debug(
      'WorkTech configuration is not set up. Skipping module initialization.'
    )
    return
  }

  const childProcesses: ChildProcess[] = []

  /*
   * Active Equipment
   */

  // eslint-disable-next-line no-secrets/no-secrets
  if (getConfigProperty('modules.worktechUpdate.activeEquipment.isEnabled')) {
    if (hasFasterApi) {
      const taskPath = './modules/worktechUpdate/tasks/activeEquipment.task.js'
      childProcesses.push(fork(taskPath))
    } else {
      debug(
        'Optional "@cityssm/faster-api" package is required for active equipment syncing.'
      )
    }
  }

  /*
   * Set up exit hook
   */

  exitHook(() => {
    for (const childProcess of childProcesses) {
      childProcess.kill()
    }
  })

  debug(`"${moduleName}" initialized.`)
}
