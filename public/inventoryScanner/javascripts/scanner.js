"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const scannerUrlPrefix = (document.querySelector('main')?.dataset.urlPrefix ?? '') +
        '/apps/inventoryScanner';
    const formElement = document.querySelector('#form--scanner');
    /*
     * Scanner Key
     */
    let scannerKey = globalThis.localStorage.getItem('scannerKey');
    if (scannerKey === null) {
        scannerKey = crypto.randomUUID().slice(-10);
        globalThis.localStorage.setItem('scannerKey', scannerKey);
    }
    ;
    formElement.querySelector('#scanner--scannerKey').value =
        scannerKey;
    /*
     * Repair refresh
     */
    const workOrderNumberInputElement = formElement.querySelector('#scanner--workOrderNumber');
    let lastSearchedWorkOrderNumber = '';
    const repairIdSelectElement = formElement.querySelector('#scanner--repairId');
    function renderRepairIds(records) {
        for (const record of records) {
            if (record.repairId !== null) {
                const optionElement = document.createElement('option');
                optionElement.textContent = record.repairDescription;
                optionElement.value = record.repairId.toString();
                repairIdSelectElement.append(optionElement);
            }
        }
    }
    function refreshRepairIdSelect() {
        if (lastSearchedWorkOrderNumber === workOrderNumberInputElement.value) {
            return;
        }
        lastSearchedWorkOrderNumber = workOrderNumberInputElement.value;
        if (lastSearchedWorkOrderNumber === '') {
            renderRepairIds([]);
            return;
        }
        repairIdSelectElement.replaceChildren();
        repairIdSelectElement.innerHTML = '<option value="">(Auto-Detect)</option>';
        repairIdSelectElement.value = '';
        cityssm.postJSON(`${scannerUrlPrefix}/doGetRepairRecords`, {
            workOrderNumber: lastSearchedWorkOrderNumber
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            renderRepairIds(responseJSON.records);
        });
    }
    refreshRepairIdSelect();
    workOrderNumberInputElement.addEventListener('keyup', refreshRepairIdSelect);
    /*
     * Clear buttons
     */
    function clearFieldAndFocus(event) {
        event.preventDefault();
        const inputElement = event.currentTarget
            .closest('.field')
            ?.querySelector('input, select');
        inputElement.value = '';
        if (inputElement.name === 'workOrderNumber') {
            refreshRepairIdSelect();
        }
        inputElement.focus();
    }
    const clearButtonElements = formElement.querySelectorAll('button.is-clear-button');
    for (const clearButtonElement of clearButtonElements) {
        clearButtonElement.addEventListener('click', clearFieldAndFocus);
    }
    /*
     * Form submit
     */
    const itemNumberElement = formElement.querySelector('#scanner--itemNumber');
    const quantityElement = formElement.querySelector('#scanner--quantity');
    formElement.addEventListener('submit', (formEvent) => {
        formEvent.preventDefault();
        cityssm.postJSON(`${scannerUrlPrefix}/doCreateScannerRecord`, formEvent.currentTarget, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                quantityElement.value = '1';
                itemNumberElement.value = '';
                itemNumberElement.focus();
            }
            else {
                bulmaJS.alert({
                    title: 'Error Recording Scan',
                    message: 'Please try again.',
                    contextualColorName: 'danger'
                });
            }
        });
    });
})();
