"use strict";
// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    var _a, _b, _c;
    const moduleUrlPrefix = `${(_b = (_a = document.querySelector('main')) === null || _a === void 0 ? void 0 : _a.dataset.urlPrefix) !== null && _b !== void 0 ? _b : ''}/modules/inventoryScanner`;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const fiveMinutesMillis = 5 * 60000;
    /*
     * Item Requests
     */
    const itemRequestsElement = document.querySelector('#itemRequests--column');
    let itemRequestsCount = exports.itemRequestsCount;
    function renderItemRequests() {
        ;
        (itemRequestsElement === null || itemRequestsElement === void 0 ? void 0 : itemRequestsElement.querySelector('span')).textContent =
            itemRequestsCount.toString();
        if (itemRequestsCount === 0) {
            itemRequestsElement === null || itemRequestsElement === void 0 ? void 0 : itemRequestsElement.classList.add('is-hidden');
        }
        else {
            itemRequestsElement === null || itemRequestsElement === void 0 ? void 0 : itemRequestsElement.classList.remove('is-hidden');
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
    globalThis.setInterval(refreshItemRequests, fiveMinutesMillis);
    /*
     * Pending Scanner Records
     */
    let pendingRecords = exports.pendingRecords;
    let unknownCount = 0;
    let errorCount = 0;
    const pendingRecordsUnknownCountElement = document.querySelector('#pending--unknownCount');
    const pendingRecordsErrorCountElement = document.querySelector('#pending--errorCount');
    const pendingRecordsTbodyElement = document.querySelector('#tbody--pending');
    const syncRecordsButtonElement = document.querySelector('#pending--doSync');
    function unlockField(clickEvent) {
        var _a;
        clickEvent.preventDefault();
        const inputOrSelectElement = (_a = clickEvent.currentTarget
            .closest('.field')) === null || _a === void 0 ? void 0 : _a.querySelector('input, select');
        inputOrSelectElement.removeAttribute('readonly');
        if (inputOrSelectElement.tagName === 'SELECT') {
            const optionElements = inputOrSelectElement.querySelectorAll('option');
            for (const optionElement of optionElements) {
                optionElement.classList.remove('is-hidden');
                optionElement.disabled = false;
            }
        }
        inputOrSelectElement.focus();
    }
    function renderRepairIds(records) {
        const repairIdSelectElement = document.querySelector('#updatePending--repairId');
        if (repairIdSelectElement === null) {
            return;
        }
        for (const record of records) {
            if (record.repairId !== null) {
                const optionElement = document.createElement('option');
                if (repairIdSelectElement.hasAttribute('readonly')) {
                    optionElement.classList.add('is-hidden');
                    optionElement.disabled = true;
                }
                optionElement.textContent = record.repairDescription;
                optionElement.value = record.repairId.toString();
                repairIdSelectElement.append(optionElement);
            }
        }
    }
    let lastSearchedWorkOrderNumber = '';
    function refreshRepairIdSelect(clearOptions = true) {
        const workOrderNumberElement = document.querySelector('#updatePending--workOrderNumber');
        const repairIdSelectElement = document.querySelector('#updatePending--repairId');
        if (workOrderNumberElement === null ||
            repairIdSelectElement === null ||
            lastSearchedWorkOrderNumber === workOrderNumberElement.value ||
            (clearOptions && workOrderNumberElement.readOnly)) {
            return;
        }
        lastSearchedWorkOrderNumber = workOrderNumberElement.value;
        if (clearOptions) {
            repairIdSelectElement.replaceChildren();
            repairIdSelectElement.innerHTML =
                '<option value="">(Auto-Detect)</option>';
            repairIdSelectElement.value = '';
        }
        if (lastSearchedWorkOrderNumber === '') {
            renderRepairIds([]);
            return;
        }
        cityssm.postJSON(`${moduleUrlPrefix}/doGetRepairRecords`, {
            workOrderNumber: lastSearchedWorkOrderNumber
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            renderRepairIds(responseJSON.records);
        });
    }
    function updatePendingRecord(formElement, callbackFunction) {
        cityssm.postJSON(`${moduleUrlPrefix}/doUpdatePendingRecord`, formElement, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                pendingRecords = responseJSON.pendingRecords;
                if (callbackFunction !== undefined) {
                    callbackFunction();
                }
                renderPendingRecords();
            }
            else {
                bulmaJS.alert({
                    contextualColorName: 'danger',
                    title: 'Error Updating Record',
                    message: 'Please try again.'
                });
            }
        });
    }
    function deletePendingRecord(recordId, callbackFunction) {
        function doDelete() {
            cityssm.postJSON(`${moduleUrlPrefix}/doDeletePendingRecord`, {
                recordId
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                if (responseJSON.success) {
                    pendingRecords = responseJSON.pendingRecords;
                    callbackFunction();
                    renderPendingRecords();
                }
                else {
                    bulmaJS.alert({
                        title: 'Error Deleting Record',
                        message: 'Please try again.',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        bulmaJS.confirm({
            contextualColorName: 'warning',
            title: 'Delete Pending Record',
            message: 'Are you sure you want to delete this pending scanner record?',
            okButton: {
                callbackFunction: doDelete,
                text: 'Yes, Delete Record'
            }
        });
    }
    function openUpdateScannerRecord(clickEvent) {
        var _a, _b;
        clickEvent.preventDefault();
        const recordIndex = Number.parseInt((_b = (_a = clickEvent.currentTarget.closest('tr')) === null || _a === void 0 ? void 0 : _a.dataset.recordIndex) !== null && _b !== void 0 ? _b : '');
        lastSearchedWorkOrderNumber = '';
        // eslint-disable-next-line security/detect-object-injection
        const pendingRecord = pendingRecords[recordIndex];
        cityssm.openHtmlModal('scannerRecordEdit', {
            onshow(modalElement) {
                var _a, _b, _c, _d;
                ;
                modalElement.querySelector('#updatePending--recordId').value = pendingRecord.recordId.toString();
                modalElement.querySelector('#updatePending--recordIdSpan').textContent = pendingRecord.recordId.toString();
                modalElement.querySelector('#updatePending--scanDateTimeSpan').textContent =
                    `${pendingRecord.scanDateString} ${pendingRecord.scanTimeString}`;
                modalElement.querySelector('#updatePending--workOrderNumber').value = pendingRecord.workOrderNumber;
                const repairSelectElement = modalElement.querySelector('#updatePending--repairId');
                repairSelectElement.innerHTML = `<option value="${cityssm.escapeHTML((_b = (_a = pendingRecord.repairId) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '')}">
          ${cityssm.escapeHTML(pendingRecord.repairId === null ? '(Auto-Detect)' : (_c = pendingRecord.repairDescription) !== null && _c !== void 0 ? _c : `(Unknown Repair ID: ${pendingRecord.repairId})`)}
          </option>`;
                modalElement.querySelector('#updatePending--itemNumberSpan').innerHTML = `${pendingRecord.itemNumberPrefix === ''
                    ? ''
                    : `<span class="tag">${cityssm.escapeHTML(pendingRecord.itemNumberPrefix)}</span> -`} ${cityssm.escapeHTML(pendingRecord.itemNumber)}`;
                modalElement.querySelector('#updatePending--itemDescription').value = (_d = pendingRecord.itemDescription) !== null && _d !== void 0 ? _d : '';
                modalElement.querySelector('#updatePending--quantity').value = pendingRecord.quantity.toString();
                modalElement.querySelector('#updatePending--unitPrice').value =
                    pendingRecord.unitPrice === null
                        ? ''
                        : pendingRecord.unitPrice.toFixed(2);
            },
            onshown(modalElement, closeModalFunction) {
                var _a, _b, _c;
                bulmaJS.toggleHtmlClipped();
                bulmaJS.init(modalElement);
                (_a = modalElement
                    .querySelector('form')) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', (formEvent) => {
                    formEvent.preventDefault();
                    updatePendingRecord(formEvent.currentTarget, closeModalFunction);
                });
                const unlockButtonElements = modalElement.querySelectorAll('.is-unlock-button');
                for (const unlockButtonElement of unlockButtonElements) {
                    unlockButtonElement.addEventListener('click', unlockField);
                }
                (_b = modalElement
                    .querySelector('#updatePending--workOrderNumber')) === null || _b === void 0 ? void 0 : _b.addEventListener('keyup', () => {
                    refreshRepairIdSelect(true);
                });
                refreshRepairIdSelect(false);
                (_c = modalElement
                    .querySelector('.is-delete-button')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', (deleteClickEvent) => {
                    deleteClickEvent.preventDefault();
                    deletePendingRecord(pendingRecord.recordId, closeModalFunction);
                });
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function recordHasUnknowns(record) {
        return ((record.workOrderType === 'faster' &&
            record.repairDescription === null) ||
            record.itemDescription === null ||
            record.unitPrice === null);
    }
    function recordHasErrors(record) {
        return ((record.workOrderType === 'faster' &&
            (record.repairId === null || record.quantity <= 0)) ||
            (record.workOrderType === 'worktech' && record.itemNumberPrefix !== ''));
    }
    // eslint-disable-next-line complexity
    function renderPendingRecords() {
        var _a, _b, _c;
        const rowElements = [];
        unknownCount = 0;
        errorCount = 0;
        for (const [recordIndex, record] of pendingRecords.entries()) {
            const rowElement = document.createElement('tr');
            if (recordHasErrors(record)) {
                errorCount += 1;
            }
            if (recordHasUnknowns(record)) {
                unknownCount += 1;
            }
            rowElement.dataset.recordId = record.recordId.toString();
            rowElement.dataset.recordIndex = recordIndex.toString();
            rowElement.innerHTML = `<td>
          ${cityssm.escapeHTML(record.scanDateString)} ${cityssm.escapeHTML(record.scanTimeString)}<br />
          <small title="Scanner Record ID">#${cityssm.escapeHTML(record.recordId.toString())}</small>
        </td>`;
            const workOrderCellElement = document.createElement('td');
            // eslint-disable-next-line no-unsanitized/property
            workOrderCellElement.innerHTML =
                record.workOrderType === 'faster'
                    ? `<a href="${exports.fasterWorkOrderUrl.replace('{workOrderNumber}', record.workOrderNumber)}"
              title="Open Work Order in FASTER Web"
              target="_blank">
              ${cityssm.escapeHTML(record.workOrderNumber)}
              </a>`
                    : `${cityssm.escapeHTML(record.workOrderNumber)}<br />
              <small>${cityssm.escapeHTML(record.workOrderType)}</small>`;
            rowElement.append(workOrderCellElement);
            const repairCellElement = document.createElement('td');
            if (record.workOrderType === 'faster' &&
                record.repairDescription === null) {
                repairCellElement.classList.add('has-background-danger-light');
            }
            if (record.repairId === null) {
                repairCellElement.innerHTML = `<span
          class="${cityssm.escapeHTML(record.workOrderType === 'faster' ? 'has-text-weight-bold' : 'has-text-grey-dark')}">
          (No Repair Set)
          </span>`;
            }
            else if (record.repairDescription === null) {
                repairCellElement.innerHTML = `<span class="has-text-weight-bold">
          (Unknown Repair ID: ${cityssm.escapeHTML(record.repairId.toString())})
          </span>`;
            }
            else {
                repairCellElement.innerHTML = `${cityssm.escapeHTML(record.repairDescription)}<br />
          <small>Repair ID: ${cityssm.escapeHTML(record.repairId.toString())}</small>`;
            }
            rowElement.append(repairCellElement);
            const itemNumberCellElement = document.createElement('td');
            if (record.workOrderType === 'worktech' &&
                record.itemNumberPrefix !== '') {
                itemNumberCellElement.classList.add('has-background-danger-light');
            }
            else if (((_a = record.itemDescription) !== null && _a !== void 0 ? _a : '') === '') {
                itemNumberCellElement.classList.add('has-background-warning-light');
            }
            // eslint-disable-next-line no-unsanitized/property
            itemNumberCellElement.innerHTML = `${record.itemNumberPrefix === ''
                ? ''
                : `<span class="tag">${cityssm.escapeHTML(record.itemNumberPrefix)}</span> -`}
          ${cityssm.escapeHTML(record.itemNumber)}<br />
          <small>${cityssm.escapeHTML((_b = record.itemDescription) !== null && _b !== void 0 ? _b : '(Unknown Item)')}</small>`;
            rowElement.append(itemNumberCellElement);
            /*
             * Quantity
             */
            const quantityCellElement = document.createElement('td');
            quantityCellElement.className = 'has-text-right';
            if (record.quantity <= 0) {
                quantityCellElement.classList.add('has-text-danger-dark');
            }
            if (record.workOrderType === 'faster' && record.quantity <= 0) {
                quantityCellElement.classList.add('has-background-danger-light');
            }
            quantityCellElement.textContent = record.quantity.toString();
            rowElement.append(quantityCellElement);
            /*
             * Unit Price
             */
            const unitPriceCellElement = document.createElement('td');
            unitPriceCellElement.className = 'has-text-right';
            if (record.unitPrice === null) {
                unitPriceCellElement.classList.add('has-background-warning-light', 'has-text-weight-bold');
                unitPriceCellElement.textContent = '(Unknown Price)';
            }
            else {
                unitPriceCellElement.textContent = `$${record.unitPrice.toFixed(2)}`;
            }
            rowElement.append(unitPriceCellElement);
            /*
             * Options
             */
            rowElement.insertAdjacentHTML('beforeend', `<td class="has-text-centered">
          <button class="button" type="button" title="Record Options">
            <i class="fa-solid fa-gear" aria-hidden="true"></i>
          </button>
        </td>`);
            (_c = rowElement
                .querySelector('button')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', openUpdateScannerRecord);
            rowElements.push(rowElement);
        }
        pendingRecordsTbodyElement.replaceChildren(...rowElements);
        if (errorCount === 0) {
            pendingRecordsErrorCountElement.classList.add('is-hidden');
            syncRecordsButtonElement.disabled = false;
        }
        else {
            ;
            pendingRecordsErrorCountElement.querySelector('span').textContent = errorCount.toString();
            pendingRecordsErrorCountElement.classList.remove('is-hidden');
            syncRecordsButtonElement.disabled = true;
        }
        if (unknownCount === 0) {
            pendingRecordsUnknownCountElement.classList.add('is-hidden');
        }
        else {
            ;
            pendingRecordsUnknownCountElement.querySelector('span').textContent = unknownCount.toString();
            pendingRecordsUnknownCountElement.classList.remove('is-hidden');
        }
    }
    const autoRefreshElement = document.querySelector('#pending--autoRefresh');
    function refreshPendingRecords(clickEvent) {
        if (clickEvent !== undefined) {
            clickEvent.preventDefault();
            pendingRecordsTbodyElement.replaceChildren();
        }
        cityssm.postJSON(`${moduleUrlPrefix}/doGetPendingRecords`, {}, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            pendingRecords = responseJSON.pendingRecords;
            renderPendingRecords();
        });
    }
    function autoRefreshPendingRecords() {
        if (autoRefreshElement.checked) {
            refreshPendingRecords();
        }
    }
    renderPendingRecords();
    globalThis.addEventListener(exports.refreshPendingRecordsFromExportEventName, () => {
        pendingRecords = exports.pendingRecords;
        renderPendingRecords();
    });
    (_c = document
        .querySelector('#pending--doRefresh')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', refreshPendingRecords);
    globalThis.setInterval(autoRefreshPendingRecords, fiveMinutesMillis);
    function syncScannerRecords() {
        cityssm.postJSON(`${moduleUrlPrefix}/doSyncScannerRecords`, {}, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            bulmaJS.alert({
                title: `${responseJSON.syncedRecordCount} Record(s) Marked for Syncing`,
                message: 'The syncing process has started. The records should appear on their respective work orders shortly.',
                contextualColorName: responseJSON.syncedRecordCount === 0 ? 'info' : 'success'
            });
            pendingRecords = responseJSON.pendingRecords;
            renderPendingRecords();
        });
    }
    syncRecordsButtonElement.addEventListener('click', () => {
        if (errorCount > 0) {
            bulmaJS.alert({
                title: 'Cannot Sync Records',
                message: 'There are records with errors which must be resolved before syncing.',
                contextualColorName: 'danger'
            });
            return;
        }
        let messageHtml = 'Are you sure you are ready to sync all pending scanner records?';
        if (unknownCount > 0) {
            messageHtml += `<br /><br />
      <strong>There are ${unknownCount} record(s) with potential issues</strong>
      which may impact the success of the syncing process.`;
        }
        bulmaJS.confirm({
            title: 'Sync Scanner Records',
            message: messageHtml,
            messageIsHtml: true,
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Sync Pending Scanner Records',
                callbackFunction: syncScannerRecords
            }
        });
    });
})();
