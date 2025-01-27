import { fork } from 'node:child_process';
import camelCase from 'camelcase';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { hasFasterApi } from '../../helpers/fasterWeb.helpers.js';
import { initializeIntegrityCheckerDatabase } from './database/helpers.database.js';
import { moduleName } from './helpers/module.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:${camelCase(moduleName)}`);
export default function initializeIntegrityCheckerTasks() {
    debug(`Initializing "${moduleName}"...`);
    initializeIntegrityCheckerDatabase();
    const childProcesses = {};
    /*
     * Faster Assets
     */
    if (hasFasterApi) {
        const taskPath = './modules/integrityChecker/tasks/fasterAssets.task.js';
        childProcesses['integrityChecker.fasterAssets'] = fork(taskPath);
    }
    else {
        debug('FASTER API configuration is not set up. Skipping FASTER tasks.');
    }
    /*
     * Worktech Equipment
     */
    if (getConfigProperty('worktech') === undefined) {
        debug('WorkTech configuration is not set up. Skipping Worktech tasks.');
    }
    else {
        if (
        // eslint-disable-next-line no-secrets/no-secrets
        getConfigProperty('modules.integrityChecker.worktechEquipment.isEnabled')) {
            const taskPath = './modules/integrityChecker/tasks/worktechEquipment.task.js';
            childProcesses['integrityChecker.worktechEquipment'] = fork(taskPath);
        }
    }
    debug(`"${moduleName}" initialized.`);
    return childProcesses;
}
