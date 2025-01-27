import Debug from 'debug';
import exitHook from 'exit-hook';
import { DEBUG_NAMESPACE } from '../debug.config.js';
const debug = Debug(`${DEBUG_NAMESPACE}:childProcesses`);
const registeredChildProcesses = {};
export function registerChildProcesses(childProcesses) {
    for (const [taskName, childProcess] of Object.entries(childProcesses)) {
        registeredChildProcesses[taskName] = childProcess;
        childProcess.on('message', relayMessageToChildProcess);
    }
}
/**
 * Relays a message to a child process.
 * **Note that this should not be used directly.**
 * Instead, use `process.send` to send messages to the primary process.
 * @param message - The message to relay to the child process.
 * @returns `true` if the message was relayed to the child process, `false` if the child process is not registered.
 */
export function relayMessageToChildProcess(message) {
    if (Object.hasOwn(registeredChildProcesses, message.destinationTaskName)) {
        debug(`Relaying message to "${message.destinationTaskName}"`);
        const childProcess = registeredChildProcesses[message.destinationTaskName];
        childProcess.send(message);
        return true;
    }
    return false;
}
exitHook(() => {
    for (const childProcess of Object.values(registeredChildProcesses)) {
        childProcess.kill();
    }
});
