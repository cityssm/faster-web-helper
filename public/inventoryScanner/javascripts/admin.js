"use strict";
// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const moduleUrlPrefix = `${document.querySelector('main')?.dataset.urlPrefix ?? ''}/modules/inventoryScanner`;
    const itemRequestsElement = document.querySelector('#itemRequests--column');
    let itemRequestsCount = exports.itemRequestsCount;
    function renderItemRequests() {
        ;
        (itemRequestsElement?.querySelector('span')).textContent =
            itemRequestsCount.toString();
        if (itemRequestsCount === 0) {
            itemRequestsElement?.classList.add('is-hidden');
        }
        else {
            itemRequestsElement?.classList.remove('is-hidden');
        }
    }
    function refreshItemRequests() {
        cityssm.postJSON(`${moduleUrlPrefix}/doGetItemRequestsCount`, {}, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            itemRequestsCount = responseJSON.itemRequestsCount;
            renderItemRequests();
        });
    }
    renderItemRequests();
    globalThis.setInterval(refreshItemRequests, 5 * 60_000);
})();
