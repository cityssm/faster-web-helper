"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    var _a, _b;
    const scannerUrlPrefix = `${(_b = (_a = document.querySelector('main')) === null || _a === void 0 ? void 0 : _a.dataset.urlPrefix) !== null && _b !== void 0 ? _b : ''}/apps/inventoryScanner`;
    const formElement = document.querySelector('#form--scanner');
    const successMessageElement = document.querySelector('#scanner--successMessage');
    const scannerMessageTextElement = successMessageElement.querySelector('strong');
    function hideSuccessMessage() {
        successMessageElement.classList.add('is-hidden');
    }
    /*
     * Item Number
     */
    const itemNumberElement = formElement.querySelector('#scanner--itemNumber');
    const countedQuantityElement = formElement.querySelector('#scanner--countedQuantity');
    function jumpToQuantityInput(inputEvent) {
        if (inputEvent.key === 'Enter') {
            inputEvent.preventDefault();
            inputEvent.stopPropagation();
            if (itemNumberElement.validity.valid) {
                countedQuantityElement.focus();
            }
        }
    }
    itemNumberElement.addEventListener('keypress', jumpToQuantityInput);
    /*
     * Item Description
     */
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
     * Clear buttons
     */
    function clearFieldAndFocus(event) {
        var _a;
        event.preventDefault();
        const inputElement = (_a = event.currentTarget
            .closest('.field')) === null || _a === void 0 ? void 0 : _a.querySelector('input');
        inputElement.value = '';
        inputElement.focus();
    }
    const clearButtonElements = formElement.querySelectorAll('button.is-clear-button');
    for (const clearButtonElement of clearButtonElements) {
        clearButtonElement.addEventListener('click', clearFieldAndFocus);
    }
    /*
     * Form Submit
     */
    formElement.addEventListener('submit', (formEvent) => {
        formEvent.preventDefault();
        if (!formElement.checkValidity()) {
            return;
        }
        cityssm.postJSON(`${scannerUrlPrefix}/doRecordCountedQuantity`, formElement, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                scannerMessageTextElement.textContent = responseJSON.message;
                successMessageElement.classList.remove('is-hidden');
                globalThis.setTimeout(hideSuccessMessage, 1000);
                itemNumberElement.value = '';
                refreshItemDescription();
                countedQuantityElement.value = '';
                itemNumberElement.focus();
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Recording Inventory Scan',
                    message: responseJSON.message,
                    okButton: {
                        callbackFunction: () => {
                            if (!responseJSON.batchIsOpen) {
                                globalThis.location.reload();
                            }
                        }
                    }
                });
            }
        });
    });
})();
