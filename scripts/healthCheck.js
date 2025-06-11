// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-console */
import { getConfigProperty } from '../helpers/config.helpers.js';
import { hasFasterApi, hasFasterUnofficialApi } from '../helpers/fasterWeb.helpers.js';
function outputEnabledModules() {
    console.log();
    console.log('ENABLED MODULES');
    console.log('===============');
    console.log(`${getConfigProperty('modules.autocomplete.isEnabled') ? '🟢' : '🔴'} - autocomplete`);
    console.log(`${getConfigProperty('modules.integrityChecker.isEnabled') ? '🟢' : '🔴'} - integrityChecker`);
    console.log(`${getConfigProperty('modules.inventoryScanner.isEnabled') ? '🟢' : '🔴'} - inventoryScanner`);
    console.log(`${getConfigProperty('modules.tempFolderCleanup.isEnabled') ? '🟢' : '🔴'} - tempFolderCleanup`);
}
async function outputFasterApiStatus() {
    const fasterWebConfig = getConfigProperty('fasterWeb');
    console.log();
    console.log('FASTER API STATUS');
    console.log('=================');
    console.log(`${hasFasterApi ? '🟢' : '🔴'} - FASTER API`);
    if (hasFasterApi) {
        const fasterApiImport = await import('@cityssm/faster-api');
        const fasterApi = new fasterApiImport.FasterApi(fasterWebConfig.tenantOrBaseUrl, fasterWebConfig.apiUserName ?? '', fasterWebConfig.apiPassword ?? '');
        try {
            const apiHealth = await fasterApi.getHealthDiagnostics();
            console.log(`\t🟢 - FASTER API is responding`);
            console.log(`\t${apiHealth.success ? '🟢' : '🔴'} - FASTER API Health Check Success`);
        }
        catch {
            console.log('\t🔴 - FASTER API is not responding');
            return;
        }
    }
    console.log(`${hasFasterUnofficialApi ? '🟢' : '🔴'} - FASTER Unofficial API`);
}
outputEnabledModules();
await outputFasterApiStatus();
