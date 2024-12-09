"use strict";
// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
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
        scannerKey = crypto.randomUUID().slice(-10);
        globalThis.localStorage.setItem('scannerKey', scannerKey);
    }
    ;
    formElement.querySelector('#scanner--scannerKey').value = scannerKey;
    document.querySelector('#about--scannerKey').textContent =
        scannerKey;
    /*
     * History
     */
    const historyContainerElement = document.querySelector('#history--container');
    function toggleHistoryViewMore(clickEvent) {
        clickEvent.preventDefault();
        clickEvent.currentTarget
            .closest('.panel-block')
            ?.querySelector('.is-view-more-container')
            ?.classList.toggle('is-hidden');
    }
    function doDeleteScannerRecord(recordId) {
        cityssm.postJSON(`${scannerUrlPrefix}/doDeleteScannerRecord`, {
            recordId,
            scannerKey
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                renderHistory(responseJSON.records);
            }
            else {
                bulmaJS.alert({
                    title: 'Error Deleting Record',
                    message: 'If the problem persists, try the admin interface.',
                    contextualColorName: 'danger'
                });
            }
        });
    }
    function confirmDeleteScannerRecord(clickEvent) {
        clickEvent.preventDefault();
        const buttonElement = clickEvent.currentTarget;
        bulmaJS.confirm({
            title: 'Delete Scanner Record',
            message: 'Are you sure you want to delete this scanner record?',
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Delete Record',
                callbackFunction: () => {
                    const recordId = buttonElement.closest('.panel-block').dataset
                        .recordId ?? '';
                    doDeleteScannerRecord(recordId);
                }
            }
        });
    }
    function renderHistory(scannerRecords) {
        if (scannerRecords.length === 0) {
            historyContainerElement.replaceChildren();
            historyContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no recent scans for this scanner.</p>
        </div>`;
            return;
        }
        const panelElement = document.createElement('div');
        panelElement.className = 'panel';
        for (const record of scannerRecords) {
            const panelBlockElement = document.createElement('div');
            panelBlockElement.className = 'panel-block is-block';
            panelBlockElement.dataset.recordId = record.recordId.toString();
            // eslint-disable-next-line no-unsanitized/property
            panelBlockElement.innerHTML = `<div class="columns is-mobile">
          <div class="column is-narrow">
            <span class="icon is-small">
              <i class="fa-solid fa-clock" title="Scan Time"></i>
            </span>
          </div>
          <div class="column">
            ${cityssm.escapeHTML(record.scanTimeString)}
          </div>
          <div class="column">
            ${cityssm.escapeHTML(record.itemNumber)}
          </div>
          <div class="column is-narrow">
            <button class="button is-view-more-button" type="button" title="View More">
              <i class="fa-solid fa-caret-down" aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div class="is-view-more-container is-hidden">
          <div class="columns is-mobile">
            <div class="column is-narrow">
              <span class="icon is-small">
                <i class="fa-solid fa-clipboard" title="Work Order"></i>
              </span>
            </div>
            <div class="column">
              ${cityssm.escapeHTML(record.workOrderNumber)}
                (${cityssm.escapeHTML(record.workOrderType)})<br />
              <span class="repairContainer"></span>
            </div>
          </div>
          <div class="columns is-mobile">
            <div class="column is-narrow">
              <span class="icon is-small">
                <i class="fa-solid fa-bag-shopping" title="Item"></i>
              </span>
            </div>
            <div class="column">
              ${cityssm.escapeHTML(record.itemNumber)}
                (${cityssm.escapeHTML(record.itemStoreroom ?? '')})<br />
              ${cityssm.escapeHTML(record.itemDescription ?? '')}<br />
              ${cityssm.escapeHTML(record.quantity.toString())}
                &times;
                $${cityssm.escapeHTML(record.unitPrice === null ? '--.-' : record.unitPrice.toFixed(2))}
            </div>
          </div>
          <div class="columns is-mobile">
            <div class="column is-narrow">
              <span class="icon is-small">
                <i class="fa-solid fa-arrow-up-from-bracket" title="Sync"></i>
              </span>
            </div>
            ${record.recordSync_timeMillis === null
                ? `<div class="column">
                    Not Yet Synced
                    </div>
                    <div class="column is-narrow">
                      <button class="button is-delete-button is-danger" type="button" title="Delete Record">
                        <i class="fa-solid fa-trash" aria-hidden="true"></i>
                      </button>
                    </div>`
                : `<div class="column">
                    Synced
                    </div>`}
            </div>
          </div>
        </div>`;
            if (record.repairId !== null || record.repairDescription !== null) {
                panelBlockElement.querySelector('.repairContainer')?.insertAdjacentHTML('beforeend', `${cityssm.escapeHTML(record.repairDescription ?? '')}
            (${cityssm.escapeHTML(record.repairId === null ? '' : record.repairId.toString())})`);
            }
            panelBlockElement
                .querySelector('.is-view-more-button')
                ?.addEventListener('click', toggleHistoryViewMore);
            panelBlockElement
                .querySelector('.is-delete-button')
                ?.addEventListener('click', confirmDeleteScannerRecord);
            panelElement.append(panelBlockElement);
        }
        historyContainerElement.replaceChildren(panelElement);
    }
    function refreshHistory() {
        cityssm.postJSON(`${scannerUrlPrefix}/doGetScannerRecords`, {
            scannerKey
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            renderHistory(responseJSON.records);
        });
    }
    // Ensure the scanner is initialized before retrieving the history
    globalThis.setTimeout(refreshHistory, 500);
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
        hideSuccessMessage();
        lastSearchedWorkOrderNumber = workOrderNumberInputElement.value;
        repairIdSelectElement.replaceChildren();
        repairIdSelectElement.innerHTML = '<option value="">(Auto-Detect)</option>';
        repairIdSelectElement.value = '';
        if (lastSearchedWorkOrderNumber === '') {
            renderRepairIds([]);
            return;
        }
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
     * Quantity Multiplier
     */
    const quantityMultiplierElement = formElement.querySelector('#scanner--quantityMultiplier');
    const quantityMultiplierToggleElement = formElement.querySelector('#is-toggle-quantity-multiplier');
    const quantityElement = formElement.querySelector('#scanner--quantity');
    const submitButtonElement = formElement.querySelector('button[type="submit"]');
    function renderQuantityMultiplier() {
        if (quantityMultiplierElement.value === '1') {
            quantityMultiplierToggleElement.innerHTML =
                '<span class="icon"><i class="fa-solid fa-plus" aria-hidden="true"></i></span>';
            submitButtonElement.textContent = 'Issue Item(s)';
        }
        else {
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
    const itemNumberElement = formElement.querySelector('#scanner--itemNumber');
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
                itemNumberElement.value = '';
                itemNumberElement.focus();
                renderHistory(responseJSON.records);
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
