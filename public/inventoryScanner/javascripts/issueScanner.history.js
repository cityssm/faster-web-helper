(() => {
    var _a, _b;
    const scannerUrlPrefix = `${(_b = (_a = document.querySelector('main')) === null || _a === void 0 ? void 0 : _a.dataset.urlPrefix) !== null && _b !== void 0 ? _b : ''}/apps/inventoryScanner`;
    const scannerKey = globalThis.localStorage.getItem('scannerKey');
    /*
     * History
     */
    const historyContainerElement = document.querySelector('#history--container');
    function toggleHistoryViewMore(clickEvent) {
        var _a, _b;
        clickEvent.preventDefault();
        (_b = (_a = clickEvent.currentTarget
            .closest('.panel-block')) === null || _a === void 0 ? void 0 : _a.querySelector('.is-view-more-container')) === null || _b === void 0 ? void 0 : _b.classList.toggle('is-hidden');
    }
    function doDeleteScannerRecord(recordId) {
        cityssm.postJSON(`${scannerUrlPrefix}/doDeleteScannerRecord`, {
            recordId,
            scannerKey
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            if (responseJSON.success) {
                exports.scannerHistory = responseJSON.records;
                renderScannerHistory();
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
                    var _a;
                    const recordId = (_a = buttonElement.closest('.panel-block').dataset
                        .recordId) !== null && _a !== void 0 ? _a : '';
                    doDeleteScannerRecord(recordId);
                }
            }
        });
    }
    function renderScannerHistory() {
        var _a, _b, _c, _d, _e, _f;
        if (exports.scannerHistory.length === 0) {
            historyContainerElement.replaceChildren();
            historyContainerElement.innerHTML = `<div class="message is-info">
          <p class="message-body">There are no recent scans for this scanner.</p>
          </div>`;
            return;
        }
        const panelElement = document.createElement('div');
        panelElement.className = 'panel';
        for (const record of exports.scannerHistory) {
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
              ${record.itemNumberPrefix === ''
                ? ''
                : `<span class="tag">${cityssm.escapeHTML(record.itemNumberPrefix)}</span> -`}
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
                ${record.itemNumberPrefix === ''
                ? ''
                : `<span class="tag">${cityssm.escapeHTML(record.itemNumberPrefix)}</span> -`}
                ${cityssm.escapeHTML(record.itemNumber)}
                  (${cityssm.escapeHTML((_a = record.itemStoreroom) !== null && _a !== void 0 ? _a : '')})<br />
                ${cityssm.escapeHTML((_b = record.itemDescription) !== null && _b !== void 0 ? _b : '')}<br />
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
                (_c = panelBlockElement.querySelector('.repairContainer')) === null || _c === void 0 ? void 0 : _c.insertAdjacentHTML('beforeend', `${cityssm.escapeHTML((_d = record.repairDescription) !== null && _d !== void 0 ? _d : '')}
              (${cityssm.escapeHTML(record.repairId === null ? '' : record.repairId.toString())})`);
            }
            (_e = panelBlockElement
                .querySelector('.is-view-more-button')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', toggleHistoryViewMore);
            (_f = panelBlockElement
                .querySelector('.is-delete-button')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', confirmDeleteScannerRecord);
            panelElement.append(panelBlockElement);
        }
        historyContainerElement.replaceChildren(panelElement);
    }
    function refreshScannerHistory() {
        cityssm.postJSON(`${scannerUrlPrefix}/doGetScannerRecords`, {
            scannerKey
        }, (rawResponseJSON) => {
            const responseJSON = rawResponseJSON;
            exports.scannerHistory = responseJSON.records;
            renderScannerHistory();
        });
    }
    // Ensure the scanner is initialized before retrieving the history
    globalThis.setTimeout(refreshScannerHistory, 500);
    globalThis.addEventListener(exports.renderScannerHistoryEventName, () => {
        renderScannerHistory();
    });
})();
