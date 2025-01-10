import Debug from 'debug';
import exitHook from 'exit-hook';
const debug = Debug('faster-web-helper:childProcesses');
const registeredChildProcesses = {};
export function registerChildProcesses(childProcesses) {
    for (const [taskName, childProcess] of Object.entries(childProcesses)) {
        registeredChildProcesses[taskName] = childProcess;
    }
}
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
