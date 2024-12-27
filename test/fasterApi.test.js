import assert from 'node:assert';
import { describe, it } from 'node:test';
import hasPackage from '@cityssm/has-package';
await describe('faster-web-helper/faster-api', async () => {
    await it('Has access to @cityssm/faster-api', async () => {
        const hasFasterApi = await hasPackage('@cityssm/faster-api');
        assert.ok(hasFasterApi, 'Package @cityssm/faster-api is not installed');
    });
});
