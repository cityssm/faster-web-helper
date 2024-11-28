"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const moduleUrlPrefix = `${document.querySelector('main')?.dataset.urlPrefix ?? ''}/modules/inventoryScanner`;
    let pendingRecords = exports.pendingRecords;
    const pendingRecordsTbodyElement = document.querySelector('#tbody--pending');
    function openUpdateScannerRecord(clickEvent) {
        cityssm.openHtmlModal('scannerRecordEdit', {
            onshown(modalElement, closeModalFunction) {
                bulmaJS.toggleHtmlClipped();
                bulmaJS.init(modalElement);
            },
            onremoved() {
                bulmaJS.toggleHtmlClipped();
            }
        });
    }
    function recordHasUnknowns(record) {
        return ((record.workOrderType === 'faster' &&
            (record.repairId === null || record.repairDescription === '')) ||
            record.itemDescription === null ||
            record.unitPrice === null);
    }
    function renderPendingRecords() {
        const rowElements = [];
        for (const [recordIndex, record] of pendingRecords.entries()) {
            const rowElement = document.createElement('tr');
            if (recordHasUnknowns(record)) {
                rowElement.classList.add('is-warning');
            }
            rowElement.dataset.recordId = record.recordId.toString();
            rowElement.dataset.recordIndex = recordIndex.toString();
            rowElement.innerHTML = `<td>
          ${cityssm.escapeHTML(record.scanDateString)} ${cityssm.escapeHTML(record.scanTimeString)}<br />
          <small title="Scanner Record ID">#${cityssm.escapeHTML(record.recordId.toString())}</small>
        </td>`;
            let workOrderHTML = '';
            workOrderHTML =
                record.workOrderType === 'faster'
                    ? `<a href="${exports.fasterWorkOrderUrl.replace('{workOrderNumber}', record.workOrderNumber)}"
              title="Open Work Order In FASTER Web"
              target="_blank">
              ${cityssm.escapeHTML(record.workOrderNumber)}
              </a>`
                    : `${cityssm.escapeHTML(record.workOrderNumber)}<br />
              <small>${cityssm.escapeHTML(record.workOrderType)}</small>`;
            // eslint-disable-next-line no-unsanitized/method
            rowElement.insertAdjacentHTML('beforeend', `<td>
          ${workOrderHTML}
        </td>`);
            rowElement.insertAdjacentHTML('beforeend', `<td>
          ${cityssm.escapeHTML(record.repairDescription ?? '(Unknown Repair)')}<br />
          <small title="Repair ID">${cityssm.escapeHTML((record.repairId ?? '').toString())}</small>
        </td><td>
          ${cityssm.escapeHTML(record.itemNumber)}<br />
          <small>${cityssm.escapeHTML(record.itemDescription ?? '(Unknown Item)')}</small>
        </td><td class="has-text-right">
          ${cityssm.escapeHTML(record.quantity.toString())}
        </td><td class="has-text-right">
          ${cityssm.escapeHTML(record.unitPrice === null ? '(Unknown Price)' : `$${record.unitPrice.toFixed(2)}`)}
        </td><td class="has-text-centered">
          <button class="button" type="button" title="Record Options">
            <i class="fa-solid fa-gear" aria-hidden="true"></i>
          </button>
        </td>`);
            rowElement
                .querySelector('button')
                ?.addEventListener('click', openUpdateScannerRecord);
            rowElements.push(rowElement);
        }
        pendingRecordsTbodyElement.replaceChildren(...rowElements);
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
    document
        .querySelector('#pending--doRefresh')
        ?.addEventListener('click', refreshPendingRecords);
    globalThis.setInterval(autoRefreshPendingRecords, 5 * 60_000);
})();
