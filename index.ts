import cluster, { type Worker } from 'node:cluster'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { secondsToMillis } from '@cityssm/to-millis'
import Debug from 'debug'
import { asyncExitHook } from 'exit-hook'
import schedule from 'node-schedule'

import { getConfigProperty } from './helpers/config.functions.js'
import type { WorkerMessage } from './types/applicationTypes.js'

const debug = Debug(`lot-occupancy-system:www:${process.pid}`)

const directoryName = path.dirname(fileURLToPath(import.meta.url))

process.title = `Faster Web Helper (Primary)`

debug(`Primary pid:   ${process.pid}`)
debug(`Primary title: ${process.title}`)

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
      './modules/inventoryScanner/initializeInventoryScanner.js'
    )
    initializeInventoryScannerModule.initializeInventoryScannerTasks()
  }

  if (getConfigProperty('modules.tempFolderCleanup.isEnabled')) {
    const initializeTempFolderCleanupModule = await import(
      './modules/tempFolderCleanup/initializeTempFolderCleanupModule.js'
    )
    initializeTempFolderCleanupModule.initializeTempFolderCleanupTask()
  }

  if (getConfigProperty('modules.worktechUpdate.isEnabled')) {
    const initializeWorktechUpdateModule = await import(
      './modules/worktechUpdate/initializeWorktechUpdate.js'
    )
    initializeWorktechUpdateModule.initializeWorktechUpdateTasks()
  }

  await Promise.all(promises)
}

function initializeAppWorkers(): void {
  const processCount = Math.min(os.cpus().length, 2)

  debug(`Launching ${processCount} web app processes`)

  const clusterSettings = {
    exec: `${directoryName}/app/appProcess.js`
  }

  cluster.setupPrimary(clusterSettings)

  const activeWorkers = new Map<number, Worker>()

  for (let index = 0; index < processCount; index += 1) {
    const worker = cluster.fork()
    activeWorkers.set(worker.process.pid ?? 0, worker)
  }

  cluster.on('message', (worker, message: WorkerMessage) => {
    for (const [pid, activeWorker] of activeWorkers.entries()) {
      if (pid === message.pid) {
        continue
      }
  
      debug(`Relaying message to worker: ${pid}`)
      activeWorker.send(message)
    }
  })

  cluster.on('exit', (worker) => {
    debug(`Worker ${(worker.process.pid ?? 0).toString()} has been killed`)
    activeWorkers.delete(worker.process.pid ?? 0)

    debug('Starting another worker')
    cluster.fork()
  })
}

await initializeModuleTasks()
initializeAppWorkers()

if (process.env.STARTUP_TEST === 'true') {
  const killSeconds = 10

  debug(`Killing processes in ${killSeconds} seconds...`)

  setTimeout(() => {
    debug('Killing processes')

    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(0)
  }, secondsToMillis(killSeconds))
}

asyncExitHook(
  async () => {
    await schedule.gracefulShutdown()
  },
  {
    wait: secondsToMillis(1)
  }
)
