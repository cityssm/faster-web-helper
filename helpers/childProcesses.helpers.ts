import type { ChildProcess } from 'node:child_process'

import Debug from 'debug'
import exitHook from 'exit-hook'

import { DEBUG_NAMESPACE } from '../debug.config.js'
import type { TaskName, TaskWorkerMessage } from '../types/tasks.types.js'

const debug = Debug(`${DEBUG_NAMESPACE}:childProcesses`)

const registeredChildProcesses: Partial<Record<TaskName, ChildProcess>> = {}

export function registerChildProcesses(
  childProcesses: Partial<Record<TaskName, ChildProcess>>
): void {
  for (const [taskName, childProcess] of Object.entries(childProcesses)) {
    // eslint-disable-next-line security/detect-object-injection
    registeredChildProcesses[taskName] = childProcess

    childProcess.on('message', relayMessageToChildProcess)
  }
}

/**
 * Relays a message to a child process.
 * **Note that this should not be used directly.**
 * Instead, use `process.send` to send messages to the primary process.
 * @param message - The message to relay to the child process.
 * @returns `true` if the message was relayed to the child process, `false` if the child process is not registered.
 */
export function relayMessageToChildProcess(
  message: TaskWorkerMessage
): boolean {
  if (Object.hasOwn(registeredChildProcesses, message.destinationTaskName)) {
    debug(`Relaying message to "${message.destinationTaskName}"`)

    const childProcess = registeredChildProcesses[
      message.destinationTaskName
    ] as ChildProcess
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
