"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const scannerUrlPrefix = `${document.querySelector('main')?.dataset.urlPrefix ?? ''}/apps/inventoryScanner`;
    const formElement = document.querySelector('#form--scanner');
    const successMessageElement = document.querySelector('#scanner--successMessage');
    function hideSuccessMessage() {
        successMessageElement.classList.add('is-hidden');
    }
    /*
     * Scanner Key
     */
    let scannerKey = globalThis.localStorage.getItem('scannerKey');
    if (scannerKey === null) {
        // eslint-disable-next-line sonarjs/pseudo-random, @typescript-eslint/no-magic-numbers
        scannerKey = Math.random().toString(36).slice(2, 10).toUpperCase();
        globalThis.localStorage.setItem('scannerKey', scannerKey);
    }
    ;
    formElement.querySelector('#scanner--scannerKey').value = scannerKey;
    document.querySelector('#about--scannerKey').textContent =
        scannerKey;
    /*
     * Repair refresh
     */
    const workOrderNumberInputElement = formElement.querySelector('#scanner--workOrderNumber');
    const workOrderNumberValidateIconElement = formElement.querySelector('#scanner--workOrderNumber-validateIcon');
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
        hideSuccessMessage();
        lastSearchedWorkOrderNumber = workOrderNumberInputElement.value;
        repairIdSelectElement.replaceChildren();
        repairIdSelectElement.innerHTML = '<option value="">(Auto-Detect)</option>';
        repairIdSelectElement.value = '';
        if (!workOrderNumberInputElement.checkValidity()) {
            workOrderNumberValidateIconElement.replaceChildren();
            if (lastSearchedWorkOrderNumber === '') {
                workOrderNumberValidateIconElement.insertAdjacentHTML('beforeend', '<i class="fa-solid fa-question-circle has-text-info" aria-hidden="true"></i>');
                workOrderNumberValidateIconElement.title = 'Work Order Required';
            }
            else {
                workOrderNumberValidateIconElement.insertAdjacentHTML('beforeend', '<i class="fa-solid fa-exclamation-triangle has-text-warning" aria-hidden="true"></i>');
                workOrderNumberValidateIconElement.title = 'Invalid Work Order Format';
            }
            renderRepairIds([]);
            return;
        }
        cityssm.postJSON(`${scannerUrlPrefix}/doGetRepairRecords`, {
            workOrderNumber: lastSearchedWorkOrderNumber
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            workOrderNumberValidateIconElement.replaceChildren();
            if (responseJSON.records.length === 0) {
                workOrderNumberValidateIconElement.insertAdjacentHTML('beforeend', '<i class="fa-solid fa-question-circle has-text-warning" aria-hidden="true"></i>');
                workOrderNumberValidateIconElement.title = 'Unknown Work Order';
            }
            else {
                workOrderNumberValidateIconElement.insertAdjacentHTML('beforeend', '<i class="fa-solid fa-check has-text-success" aria-hidden="true"></i>');
                workOrderNumberValidateIconElement.title = 'Valid Work Order';
            }
            renderRepairIds(responseJSON.records);
        });
    }
    refreshRepairIdSelect();
    workOrderNumberInputElement.addEventListener('keyup', refreshRepairIdSelect);
    /*
     * Item Type Toggle
     */
    const itemTypeTabElements = document.querySelectorAll('#scanner--itemTypeTabs a');
    const itemNumberSuffixElement = formElement.querySelector('#scanner--itemNumberSuffix');
    const itemDescriptionElement = formElement.querySelector('#scanner--itemDescription');
    const unitPriceElement = formElement.querySelector('#scanner--unitPrice');
    function toggleItemTypeFieldsets() {
        for (const itemTypeTabElement of itemTypeTabElements) {
            const tabIsActive = itemTypeTabElement.closest('li')?.classList.contains('is-active') ??
                false;
            document.querySelector(`#itemTypeTab--${itemTypeTabElement.dataset.itemType ?? ''} fieldset`).disabled = !tabIsActive;
            if (tabIsActive) {
                ;
                document.querySelector('#scanner--itemType').value = itemTypeTabElement.dataset.itemType ?? '';
            }
        }
    }
    toggleItemTypeFieldsets();
    for (const itemTypeTabElement of itemTypeTabElements) {
        itemTypeTabElement.addEventListener('click', toggleItemTypeFieldsets);
    }
    /*
     * Item Description
     */
    const itemNumberElement = formElement.querySelector('#scanner--itemNumber');
    let lastSearchedItemNumber = '';
    const itemDescriptionSpanElement = formElement.querySelector('#scanner--itemDescriptionSpan');
    const unitPriceSpanElement = formElement.querySelector('#scanner--unitPriceSpan');
    function refreshItemDescription() {
        const itemNumber = itemNumberElement.value;
        if (itemNumber === '') {
            itemDescriptionSpanElement.textContent = '(No Item Number Entered)';
            unitPriceSpanElement.textContent = '';
            return;
        }
        else if (!itemNumberElement.checkValidity()) {
            itemDescriptionSpanElement.textContent = '(Item Number Invalid)';
            unitPriceSpanElement.textContent = '';
            return;
        }
        else if (itemNumber === lastSearchedItemNumber) {
            return;
        }
        lastSearchedItemNumber = itemNumber;
        cityssm.postJSON(`${scannerUrlPrefix}/doGetItemDescription`, {
            itemNumber
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            itemDescriptionSpanElement.textContent = responseJSON.itemDescription;
            unitPriceSpanElement.textContent =
                responseJSON.unitPrice === undefined
                    ? ''
                    : `$${responseJSON.unitPrice.toFixed(2)}`;
        });
    }
    refreshItemDescription();
    itemNumberElement.addEventListener('keyup', refreshItemDescription);
    /*
     * Quantity Multiplier
     */
    const quantityLabelElement = formElement.querySelector('label[for="scanner--quantity"]');
    const quantityMultiplierElement = formElement.querySelector('#scanner--quantityMultiplier');
    const quantityMultiplierToggleElement = formElement.querySelector('#is-toggle-quantity-multiplier');
    const quantityElement = formElement.querySelector('#scanner--quantity');
    const submitButtonElement = formElement.querySelector('button[type="submit"]');
    function renderQuantityMultiplier() {
        if (quantityMultiplierElement.value === '1') {
            quantityLabelElement.textContent = 'Issue Quantity';
            quantityMultiplierToggleElement.innerHTML =
                '<span class="icon"><i class="fa-solid fa-plus" aria-hidden="true"></i></span>';
            submitButtonElement.textContent = 'Issue Item(s)';
        }
        else {
            quantityLabelElement.textContent = 'Return Quantity';
            quantityMultiplierToggleElement.innerHTML =
                '<span class="icon"><i class="fa-solid fa-minus" aria-hidden="true"></i></span>';
            submitButtonElement.textContent = 'Return Item(s)';
        }
    }
    quantityMultiplierToggleElement.addEventListener('click', () => {
        quantityMultiplierElement.value =
            quantityMultiplierElement.value === '1' ? '-1' : '1';
        renderQuantityMultiplier();
    });
    quantityMultiplierElement.value = '1';
    renderQuantityMultiplier();
    /*
     * Clear buttons
     */
    function clearFieldAndFocus(event) {
        event.preventDefault();
        const inputElement = event.currentTarget
            .closest('.field')
            ?.querySelector('input, select');
        inputElement.value = '';
        if (inputElement.name === workOrderNumberInputElement.name) {
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
    function blockInputSubmit(inputEvent) {
        if (inputEvent.key === 'Enter') {
            inputEvent.preventDefault();
            inputEvent.stopPropagation();
        }
    }
    workOrderNumberInputElement.addEventListener('keypress', blockInputSubmit);
    itemNumberElement.addEventListener('keypress', blockInputSubmit);
    formElement.addEventListener('submit', (formEvent) => {
        formEvent.preventDefault();
        if (!formElement.checkValidity()) {
            return;
        }
        if (quantityElement.value === '0') {
            quantityElement.focus();
            return;
        }
        cityssm.postJSON(`${scannerUrlPrefix}/doCreateScannerRecord`, formElement, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                successMessageElement.classList.remove('is-hidden');
                globalThis.setTimeout(hideSuccessMessage, 1000);
                quantityMultiplierElement.value = '1';
                renderQuantityMultiplier();
                quantityElement.value = '1';
                itemNumberSuffixElement.value = '';
                itemDescriptionElement.value = '';
                unitPriceElement.value = '';
                itemTypeTabElements[0].click();
                itemNumberElement.value = '';
                refreshItemDescription();
                itemNumberElement.focus();
                exports.scannerHistory = responseJSON.records;
                globalThis.dispatchEvent(new Event(exports.renderScannerHistoryEventName));
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
