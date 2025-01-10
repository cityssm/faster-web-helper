import type { ChildProcess } from 'node:child_process'

import Debug from 'debug'
import exitHook from 'exit-hook'

import type { TaskName, TaskWorkerMessage } from '../types/tasks.types.js'

const debug = Debug('faster-web-helper:childProcesses')

const registeredChildProcesses: Partial<Record<TaskName, ChildProcess>> = {}

export function registerChildProcesses(
  childProcesses: Partial<Record<TaskName, ChildProcess>>
): void {
  for (const [taskName, childProcess] of Object.entries(childProcesses)) {
    registeredChildProcesses[taskName] = childProcess
  }
}

export function relayMessageToChildProcess(message: TaskWorkerMessage): boolean {

  if (Object.hasOwn(registeredChildProcesses, message.destinationTaskName)) {
    debug(`Relaying message to "${message.destinationTaskName}"`)

    const childProcess = registeredChildProcesses[message.destinationTaskName] as ChildProcess
    childProcess.send(message)
    
    return true
  }

  return false
}

exitHook(() => {
  for (const childProcess of Object.values(registeredChildProcesses)) {
    childProcess.kill()
  }
})
