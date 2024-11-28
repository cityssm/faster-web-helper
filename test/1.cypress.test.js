import assert from 'node:assert';
import { exec, fork } from 'node:child_process';
import { describe, it } from 'node:test';
await describe('faster-web-helper', async () => {
    await it('should run Cypress tests', () => {
        const appProcess = fork('app.js');
        let cypressCommand = 'cypress run --config-file cypress.config.ts --browser chrome';
        if ((process.env.CYPRESS_RECORD_KEY ?? '') !== '') {
            cypressCommand += ' --record';
        }
        // eslint-disable-next-line security/detect-child-process, sonarjs/os-command
        const childProcess = exec(cypressCommand);
        childProcess.stdout?.on('data', (data) => {
            console.log(data);
        });
        childProcess.stderr?.on('data', (data) => {
            console.error(data);
        });
        childProcess.on('exit', (code) => {
            console.log('*** EXIT');
            try {
                appProcess.kill();
            }
            catch {
                // ignore
            }
            assert.ok(code === 0);
        });
    });
});
