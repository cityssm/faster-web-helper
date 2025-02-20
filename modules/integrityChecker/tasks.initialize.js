import { fork } from 'node:child_process';
import camelCase from 'camelcase';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { hasFasterApi, hasFasterUnofficialApi } from '../../helpers/fasterWeb.helpers.js';
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
        if (getConfigProperty('modules.integrityChecker.fasterAssets.isEnabled')) {
            const taskPath = './modules/integrityChecker/tasks/assets/fasterAssets.task.js';
            childProcesses.integrityChecker_fasterAssets = fork(taskPath);
        }
    }
    else {
        debug('FASTER API configuration is not set up. Skipping FASTER tasks.');
    }
    /*
     * NHTSA Vehicles
     */
    if (getConfigProperty('modules.integrityChecker.nhtsaVehicles.isEnabled')) {
        const taskPath = './modules/integrityChecker/tasks/assets/nhtsaVehicles.task.js';
        childProcesses.integrityChecker_nhtsaVehicles = fork(taskPath);
    }
    /*
     * Worktech Equipment
     */
    if (getConfigProperty('worktech') !== undefined &&
        getConfigProperty('modules.integrityChecker.worktechEquipment.isEnabled')) {
        const taskPath = './modules/integrityChecker/tasks/assets/worktechEquipment.task.js';
        childProcesses.integrityChecker_worktechEquipment = fork(taskPath);
    }
    /*
     * Faster Inventory
     */
    if (hasFasterUnofficialApi &&
        getConfigProperty('modules.integrityChecker.fasterItems.isEnabled')) {
        const taskPath = './modules/integrityChecker/tasks/items/fasterItems.task.js';
        childProcesses.integrityChecker_fasterInventory = fork(taskPath);
    }
    debug(`"${moduleName}" initialized.`);
    return childProcesses;
}
