import cluster, { type Worker } from 'node:cluster'
import os from 'node:os'

import { nodeSchedule } from '@cityssm/scheduled-task'
import { millisecondsInOneSecond } from '@cityssm/to-millis'
import Debug from 'debug'
import { asyncExitHook } from 'exit-hook'

import { DEBUG_ENABLE_NAMESPACES, DEBUG_NAMESPACE } from './debug.config.js'
import {
  registerChildProcesses,
  relayMessageToChildProcess
} from './helpers/childProcesses.helpers.js'
import { getConfigProperty } from './helpers/config.helpers.js'
import type { TaskWorkerMessage } from './types/tasks.types.js'

if (process.env.NODE_ENV === 'development') {
  Debug.enable(DEBUG_ENABLE_NAMESPACES)
}

const debug = Debug(`${DEBUG_NAMESPACE}:www:${process.pid}`)

process.title = 'FASTER Web Helper (Primary)'

debug(`Primary pid:   ${process.pid}`)
debug(`Primary title: ${process.title}`)

/**
 * Initialize module tasks
 */
async function initializeModuleTasks(): Promise<void> {
  const promises: Array<Promise<void>> = []

  if (getConfigProperty('modules.autocomplete.isEnabled')) {
    const initializeAutocompleteModule = await import(
      './modules/autocomplete/initializeAutocompleteModule.js'
    )
    promises.push(initializeAutocompleteModule.initializeAutocompleteTasks())
  }

  if (getConfigProperty('modules.inventoryScanner.isEnabled')) {
    const initializeInventoryScannerModule = await import(
      './modules/inventoryScanner/tasks.initialize.js'
    )

    const childProcesses = initializeInventoryScannerModule.default()

    registerChildProcesses(childProcesses)
  }

  if (getConfigProperty('modules.tempFolderCleanup.isEnabled')) {
    const initializeTempFolderCleanupModule = await import(
      './modules/tempFolderCleanup/initializeTempFolderCleanupModule.js'
    )
    initializeTempFolderCleanupModule.initializeTempFolderCleanupTask()
  }

  if (getConfigProperty('modules.integrityChecker.isEnabled')) {
    const initializeIntegrityCheckerModule = await import(
      './modules/integrityChecker/tasks.initialize.js'
    )

    const childProcesses = initializeIntegrityCheckerModule.default()

    registerChildProcesses(childProcesses)
  }

  await Promise.all(promises)

  asyncExitHook(
    async () => {
      await nodeSchedule.gracefulShutdown()
    },
    {
      wait: millisecondsInOneSecond
    }
  )
}

const maxAppProcesses = 4

/**
 * Initialize app workers
 */
function initializeAppWorkers(): void {
  const processCount = Math.min(os.cpus().length * 2, maxAppProcesses)

  debug(`Launching ${processCount} web app processes`)

  const clusterSettings = {
    exec: './app/appProcess.js'
  }

  cluster.setupPrimary(clusterSettings)

  const activeWorkers = new Map<number, Worker>()

  for (let index = 0; index < processCount; index += 1) {
    const worker = cluster.fork()
    activeWorkers.set(worker.process.pid ?? 0, worker)
  }

  cluster.on('message', (worker, message: TaskWorkerMessage) => {
    debug(`Received message from worker: ${worker.process.pid}`)

    if (message.destinationTaskName === 'app') {
      for (const [pid, activeWorker] of activeWorkers.entries()) {
        if (pid === worker.process.pid) {
          continue
        }

        debug(`Relaying message to worker: ${pid}`)
        activeWorker.send(message)
      }
    } else {
      relayMessageToChildProcess(message)
    }
  })

  cluster.on('exit', (worker) => {
    debug(`Worker ${(worker.process.pid ?? 0).toString()} has been killed`)
    activeWorkers.delete(worker.process.pid ?? 0)

    debug('Starting another worker')

    const newWorker = cluster.fork()
    activeWorkers.set(newWorker.process.pid ?? 0, newWorker)
  })
}

await initializeModuleTasks()
initializeAppWorkers()
