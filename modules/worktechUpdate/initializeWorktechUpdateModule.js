import Debug from 'debug';
import { initializeWorktechUpdateDatabase } from './database/local/databaseHelpers.js';
import { inititalizeWorktechUpdateTask } from './tasks/worktechUpdateTask.js';
const debug = Debug('faster-web-helper:worktechUpdate');
export default async function initializeWorktechUpdateModule() {
    debug('Initializing Worktech Update Module');
    initializeWorktechUpdateDatabase();
    await inititalizeWorktechUpdateTask();
}
