"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const urlPrefix = document.querySelector('main')?.dataset.urlPrefix ?? '';
    function clearFieldAndFocus(event) {
        event.preventDefault();
        const inputElement = event.currentTarget.closest('.field')?.querySelector('input');
        inputElement.value = '';
        inputElement.focus();
    }
    const clearButtonElements = document.querySelectorAll('button.is-clear-button');
    for (const clearButtonElement of clearButtonElements) {
        clearButtonElement.addEventListener('click', clearFieldAndFocus);
    }
    document.querySelector('#form--scanner')?.addEventListener('submit', (formEvent) => {
        formEvent.preventDefault();
        cityssm.postJSON(`${urlPrefix}/apps/inventoryScanner/doRecordScan`, formEvent.currentTarget, (responseJSON) => {
        });
    });
})();
