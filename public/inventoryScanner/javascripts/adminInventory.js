"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    var _a, _b;
    const moduleUrlPrefix = `${(_b = (_a = document.querySelector('main')) === null || _a === void 0 ? void 0 : _a.dataset.urlPrefix) !== null && _b !== void 0 ? _b : ''}/modules/inventoryScanner`;
    let currentBatch = exports.openBatch;
    const currentBatchButtonElement = document.querySelector('#inventory--currentBatch');
    const currentBatchDetailsElement = document.querySelector('#inventory--currentBatchDetails');
    const currentBatchItemsContainerElement = document.querySelector('#inventory--currentBatchItems');
    function confirmCloseBatch() {
        if (currentBatch === undefined) {
            return;
        }
    }
    function updateCountedQuantity(formEvent) {
        formEvent.preventDefault();
        const formElement = formEvent.currentTarget;
        const countedQuantityInputElement = formElement.querySelector('input[name="countedQuantity"]');
        let removeRow = false;
        function doUpdate() {
            cityssm.postJSON(`${moduleUrlPrefix}/doRecordCountedQuantity`, formElement, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                bulmaJS.alert({
                    message: responseJSON.message,
                    contextualColorName: responseJSON.success ? 'success' : 'danger'
                });
                const rowElement = countedQuantityInputElement.closest('tr');
                if (removeRow) {
                    rowElement.remove();
                }
                else {
                    rowElement.classList.remove('is-warning');
                }
            });
        }
        if (countedQuantityInputElement.value.trim() === '') {
            removeRow = true;
            bulmaJS.confirm({
                contextualColorName: 'warning',
                message: 'Are you sure you want to delete this counted quantity from the batch?',
                okButton: {
                    text: 'Delete Counted Quantity',
                    callbackFunction: doUpdate
                }
            });
        }
        else {
            doUpdate();
        }
    }
    function highlightUpdatedRow(keyboardEvent) {
        var _a;
        const targetElement = keyboardEvent.currentTarget;
        (_a = targetElement.closest('tr')) === null || _a === void 0 ? void 0 : _a.classList.add('is-warning');
    }
    function renderUndefinedBatch() {
        currentBatchButtonElement.value = '(No Batch Selected)';
        currentBatchDetailsElement.replaceChildren();
        currentBatchItemsContainerElement.replaceChildren();
    }
    function renderCurrentBatch() {
        var _a, _b, _c, _d, _e, _f, _g;
        if (currentBatch === undefined) {
            renderUndefinedBatch();
            return;
        }
        /*
         * Render Button
         */
        currentBatchButtonElement.value = `Batch #${currentBatch.batchId}`;
        /*
         * Render Details
         */
        currentBatchDetailsElement.innerHTML = `<p class="mb-4">
        <strong>Open Date</strong><br />
        ${cityssm.escapeHTML(currentBatch.openDateString)}
        ${cityssm.escapeHTML(currentBatch.openTimeString)}
      </p>`;
        if (currentBatch.closeDate === null) {
            currentBatchDetailsElement.insertAdjacentHTML('beforeend', `<p>
          <button class="button is-warning is-fullwidth" id="inventory--closeBatchButton" type="button">
            <span class="icon"><i class="fas fa-stop" aria-hidden="true"></i></span>
            <span>Close Batch</span>
          </button>
          </p>`);
            (_a = currentBatchDetailsElement
                .querySelector('#inventory--closeBatchButton')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', confirmCloseBatch);
        }
        else {
            currentBatchDetailsElement.insertAdjacentHTML('beforeend', `<p>
          <strong>Close Date</strong><br />
          ${cityssm.escapeHTML((_b = currentBatch.closeDateString) !== null && _b !== void 0 ? _b : '')}
          ${cityssm.escapeHTML((_c = currentBatch.closeTimeString) !== null && _c !== void 0 ? _c : '')}
          </p>`);
        }
        /*
         * Render Items
         */
        if (currentBatch.batchItems === undefined ||
            currentBatch.batchItems.length === 0) {
            currentBatchItemsContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no items in this batch.</p>
        </div>`;
            return;
        }
        const tableElement = document.createElement('table');
        tableElement.className = 'table is-fullwidth is-striped is-hoverable';
        // eslint-disable-next-line no-unsanitized/property
        tableElement.innerHTML = `<thead>
        <tr>
          <th>Storeroom</th>
          <th>Item Number</th>
          <th class="has-text-right">Counted Quantity</th>
          ${currentBatch.closeDate === null ? '<th class="has-width-1"></th>' : ''}
        </tr>
      </thead>
      <tbody></tbody>`;
        const tbodyElement = tableElement.querySelector('tbody');
        for (const batchItem of currentBatch.batchItems) {
            const rowElement = document.createElement('tr');
            rowElement.innerHTML = `<td>
          ${cityssm.escapeHTML(batchItem.itemStoreroom)}
        </td>
        <td>
          ${cityssm.escapeHTML(batchItem.itemNumber)}<br />
          <span class="is-size-7">${cityssm.escapeHTML((_d = batchItem.itemDescription) !== null && _d !== void 0 ? _d : '')}</span>
        </td>`;
            if (currentBatch.closeDate === null) {
                rowElement.insertAdjacentHTML('beforeend', `<td class="has-text-right">
            <form class="is-update-form">
              <input type="hidden" name="batchId" value="${cityssm.escapeHTML(currentBatch.batchId.toString())}" />
              <input type="hidden" name="itemStoreroom" value="${cityssm.escapeHTML(batchItem.itemStoreroom)}" />
              <input type="hidden" name="itemNumber" value="${cityssm.escapeHTML(batchItem.itemNumber)}" />
              <div class="field has-addons">
                <div class="control is-expanded">
                  <input class="input has-text-right" name="countedQuantity"
                    type="text" inputmode="numeric"
                    pattern="^[0-9]+" autocomplete="off"
                    maxlength="5"
                    value="${cityssm.escapeHTML(batchItem.countedQuantity.toString())}" />
                </div>
                <div class="control">
                  <button class="button" type="submit" title="Update Counted Quantity">
                    <span class="icon"><i class="fas fa-save" aria-hidden="true"></i></span>
                  </button>
                </div>
              </div>
            </form>
            </td>
            <td class="has-width-1 has-text-centered">
              <form class="is-delete-form">
                <input type="hidden" name="batchId" value="${cityssm.escapeHTML(currentBatch.batchId.toString())}" />
                <input type="hidden" name="itemStoreroom" value="${cityssm.escapeHTML(batchItem.itemStoreroom)}" />
                <input type="hidden" name="itemNumber" value="${cityssm.escapeHTML(batchItem.itemNumber)}" />
                <input type="hidden" name="countedQuantity" value="" />
                <button class="button is-danger is-light"
                  type="submit"
                  title="Delete Item from Batch">
                  <span class="icon"><i class="fas fa-trash" aria-hidden="true"></i></span>
                </button>
              </form>
            </td>`);
                (_e = rowElement
                    .querySelector('.is-update-form')) === null || _e === void 0 ? void 0 : _e.addEventListener('submit', updateCountedQuantity);
                (_f = rowElement
                    .querySelector('.is-delete-form')) === null || _f === void 0 ? void 0 : _f.addEventListener('submit', updateCountedQuantity);
                (_g = rowElement
                    .querySelector('.is-update-form input[name="countedQuantity"]')) === null || _g === void 0 ? void 0 : _g.addEventListener('change', highlightUpdatedRow);
            }
            else {
                rowElement.insertAdjacentHTML('beforeend', `<td class="has-text-right">
              ${cityssm.escapeHTML(batchItem.countedQuantity.toString())}
            </td>`);
            }
            tbodyElement.append(rowElement);
        }
        currentBatchItemsContainerElement.replaceChildren(tableElement);
    }
    renderCurrentBatch();
    /*
     * Batch Select
     */
    function openSelectBatchModal() {
        let modalElement;
        let closeModalFunction;
        function selectBatch(clickEvent) {
            var _a;
            clickEvent.preventDefault();
            const targetElement = clickEvent.currentTarget;
            const batchId = Number.parseInt((_a = targetElement.dataset.batchId) !== null && _a !== void 0 ? _a : '', 10);
            cityssm.postJSON(`${moduleUrlPrefix}/doGetInventoryBatch`, { batchId }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                currentBatch = responseJSON.batch;
                closeModalFunction === null || closeModalFunction === void 0 ? void 0 : closeModalFunction();
                renderCurrentBatch();
            });
        }
        function openNewBatch() {
            cityssm.postJSON(`${moduleUrlPrefix}/doOpenNewInventoryBatch`, {}, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                currentBatch = responseJSON.batch;
                closeModalFunction === null || closeModalFunction === void 0 ? void 0 : closeModalFunction();
                renderCurrentBatch();
            });
        }
        function getAvailableInventoryBatches() {
            if (modalElement === undefined) {
                return;
            }
            cityssm.postJSON(`${moduleUrlPrefix}/doGetAvailableInventoryBatches`, {}, (rawResponseJSON) => {
                var _a;
                const responseJSON = rawResponseJSON;
                const containerElement = modalElement === null || modalElement === void 0 ? void 0 : modalElement.querySelector('#container--inventoryBatchSelect');
                containerElement.replaceChildren();
                let hasOpenBatch = false;
                if (responseJSON.inventoryBatches.length === 0) {
                    containerElement.innerHTML =
                        '<div class="message is-info">' +
                            '<p class="message-body">There are no inventory batches available.</p>' +
                            '</div>';
                }
                else {
                    const panelElement = document.createElement('div');
                    panelElement.className = 'panel';
                    for (const inventoryBatch of responseJSON.inventoryBatches) {
                        const panelBlockElement = document.createElement('a');
                        panelBlockElement.className = 'panel-block is-block';
                        panelBlockElement.href = '#';
                        panelBlockElement.dataset.batchId =
                            inventoryBatch.batchId.toString();
                        // eslint-disable-next-line no-unsanitized/property
                        panelBlockElement.innerHTML = `<div class="columns is-mobile">
                  <div class="column is-narrow">
                    <i class="fas fa-list-check" aria-hidden="true"></i>
                  </div>
                  <div class="column">
                    <strong>
                      ${cityssm.escapeHTML(inventoryBatch.openDateString)}
                      ${cityssm.escapeHTML(inventoryBatch.openTimeString)}
                    </strong>
                  </div>
                  <div class="column is-narrow has-text-right">
                    <div class="tags">
                      <span class="tag is-light" title="Item Count">
                        ${((_a = inventoryBatch.batchItemCount) !== null && _a !== void 0 ? _a : 0).toLocaleString()}
                      </span>
                      ${inventoryBatch.closeDate === null
                            ? `<span class="tag is-success">
                              <span class="icon"><i class="fas fa-play" aria-hidden="true"></i></span>
                              <span>Open</span>
                              </span>`
                            : `<span class="tag is-info">
                              <span class="icon"><i class="fas fa-stop" aria-hidden="true"></i></span>
                              <span>Closed</span>
                              </span>`}
                    </div>
                  </div>
                </div>`;
                        panelBlockElement.addEventListener('click', selectBatch);
                        panelElement.append(panelBlockElement);
                        if (inventoryBatch.closeDate === null) {
                            hasOpenBatch = true;
                        }
                    }
                    containerElement.append(panelElement);
                }
                if (!hasOpenBatch) {
                    const openBatchElement = document.createElement('button');
                    openBatchElement.className = 'button is-success is-fullwidth mb-4';
                    openBatchElement.type = 'button';
                    openBatchElement.innerHTML = `<span class="icon">
                  <i class="fas fa-plus" aria-hidden="true"></i>
                </span>
                <span>Create New Inventory Batch</span>`;
                    openBatchElement.addEventListener('click', openNewBatch);
                    containerElement.prepend(openBatchElement);
                }
            });
        }
        cityssm.openHtmlModal('inventoryBatchSelect', {
            onshown(_modalElement, _closeModalFunction) {
                modalElement = _modalElement;
                closeModalFunction = _closeModalFunction;
                bulmaJS.toggleHtmlClipped();
                getAvailableInventoryBatches();
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    currentBatchButtonElement.addEventListener('click', openSelectBatchModal);
})();
