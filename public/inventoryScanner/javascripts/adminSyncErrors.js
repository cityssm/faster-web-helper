"use strict";
// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const moduleUrlPrefix = `${document.querySelector('main')?.dataset.urlPrefix ?? ''}/modules/inventoryScanner`;
    let syncErrorRecords = exports.syncErrorRecords;
    let selectedRecordIds = [];
    const syncErrorsTbodyElement = document.querySelector('#tbody--syncErrors');
    function deleteRecordsByRecordIds(recordIds) {
        function doDelete() {
            cityssm.postJSON(`${moduleUrlPrefix}/doDeleteSyncErrorRecords`, {
                recordIds
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                syncErrorRecords = responseJSON.syncErrorRecords;
                renderSyncErrorRecords();
                if (responseJSON.success) {
                    bulmaJS.alert({
                        message: 'Deleted successfully',
                        contextualColorName: 'success'
                    });
                }
                else {
                    bulmaJS.alert({
                        title: 'Error Deleting Record(s)',
                        message: 'Please try again.',
                        contextualColorName: 'danger'
                    });
                }
            });
        }
        bulmaJS.confirm({
            title: `Delete ${recordIds.length === 1 ? 'Record' : 'Records'}`,
            message: `Are you sure you want to delete ${recordIds.length === 1 ? 'this record' : 'the selected records'}?`,
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Delete',
                callbackFunction: doDelete
            }
        });
    }
    function returnRecordsToPendingByRecordIds(recordIds) {
        function doReturn() {
            cityssm.postJSON(`${moduleUrlPrefix}/doReturnSyncErrorRecordsToPending`, {
                recordIds
            }, (rawResponseJSON) => {
                const responseJSON = rawResponseJSON;
                syncErrorRecords = responseJSON.syncErrorRecords;
                renderSyncErrorRecords();
                exports.pendingRecords = responseJSON.pendingRecords;
                globalThis.dispatchEvent(new Event(exports.refreshPendingRecordsFromExportEventName));
            });
        }
        bulmaJS.confirm({
            title: `Return ${recordIds.length === 1 ? 'Record' : 'Records'} to Pending`,
            message: `Are you sure you want to return ${recordIds.length === 1 ? 'this record' : 'the selected records'} to the pending list?`,
            contextualColorName: 'warning',
            okButton: {
                text: 'Yes, Return',
                callbackFunction: doReturn
            }
        });
    }
    function deleteRecord(clickEvent) {
        clickEvent.preventDefault();
        const recordId = clickEvent.currentTarget.closest('tr')?.dataset
            .recordId ?? '';
        deleteRecordsByRecordIds([recordId]);
    }
    function returnRecordToPending(clickEvent) {
        clickEvent.preventDefault();
        const recordId = clickEvent.currentTarget.closest('tr')?.dataset
            .recordId ?? '';
        returnRecordsToPendingByRecordIds([recordId]);
    }
    function recountSelectedCheckboxes() {
        selectedRecordIds = [];
        const checkedCheckboxElements = syncErrorsTbodyElement.querySelectorAll('input[type="checkbox"]:checked');
        for (const checkboxElement of checkedCheckboxElements) {
            selectedRecordIds.push(checkboxElement.value);
        }
    }
    function renderSyncErrorRecords() {
        const rowElements = [];
        for (const record of syncErrorRecords) {
            const recordIdString = record.recordId.toString();
            const rowElement = document.createElement('tr');
            rowElement.dataset.recordId = recordIdString;
            rowElement.innerHTML = `<td class="has-text-centered">
        <input
          id="syncErrors--isSelected-${cityssm.escapeHTML(recordIdString)}"
          name="isSelected" value="${cityssm.escapeHTML(recordIdString)}"
          type="checkbox" />
        </td><td>
          ${cityssm.escapeHTML(record.scanDateString)}<br />
          ${cityssm.escapeHTML(record.scanTimeString)}
        </td>`;
            rowElement
                .querySelector('input')
                ?.addEventListener('change', recountSelectedCheckboxes);
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
            if (record.repairId === null) {
                workOrderCellElement.insertAdjacentHTML('beforeend', `<br />
            <span
              class="${cityssm.escapeHTML(record.workOrderType === 'faster' ? 'has-text-weight-bold' : 'has-text-grey-dark')}">
              (No Repair Set)
              </span>`);
            }
            else if (record.repairDescription === null) {
                workOrderCellElement.insertAdjacentHTML('beforeend', `<br />
            <span class="has-text-weight-bold">
              (Unknown Repair ID: ${cityssm.escapeHTML(record.repairId.toString())})
              </span>`);
            }
            else {
                workOrderCellElement.insertAdjacentHTML('beforeend', `<br />
            ${cityssm.escapeHTML(record.repairDescription)}<br />
            <small>Repair ID: ${cityssm.escapeHTML(record.repairId.toString())}</small>`);
            }
            rowElement.append(workOrderCellElement);
            rowElement.insertAdjacentHTML('beforeend', `<td>
          ${cityssm.escapeHTML(record.itemNumber)}<br />
          <small>${cityssm.escapeHTML(record.itemDescription ?? '(Unknown Item)')}</small>
        </td><td class="has-text-danger-dark">
          ${cityssm.escapeHTML(record.recordSync_message ?? '')}
        </td><td>
          <div class="field has-addons">
            <div class="control">
              <button class="button is-info is-return-to-pending" type="button">
                Return to Pending
              </button>
            </div>
            <div class="control">
              <button class="button is-light is-danger is-delete-record" type="button" title="Delete Record">
                <span class="icon">
                  <i class="fa-solid fa-trash" aria-hidden="true"></i>
                </span>
              </button>
            </div>
          </div>
        </td>`);
            rowElement
                .querySelector('button.is-return-to-pending')
                ?.addEventListener('click', returnRecordToPending);
            rowElement
                .querySelector('button.is-delete-record')
                ?.addEventListener('click', deleteRecord);
            rowElements.push(rowElement);
        }
        syncErrorsTbodyElement.replaceChildren(...rowElements);
    }
    renderSyncErrorRecords();
    document
        .querySelector('#syncErrors--toggleAll')
        ?.addEventListener('click', () => {
        const checkboxElements = syncErrorsTbodyElement.querySelectorAll('input[type="checkbox"]');
        if (selectedRecordIds.length === syncErrorRecords.length) {
            for (const element of checkboxElements) {
                ;
                element.checked = false;
            }
            selectedRecordIds = [];
        }
        else {
            selectedRecordIds = [];
            for (const element of checkboxElements) {
                ;
                element.checked = true;
                selectedRecordIds.push(element.value);
            }
        }
    });
    document
        .querySelector('#syncErrors--returnSelected')
        ?.addEventListener('click', () => {
        if (selectedRecordIds.length === 0) {
            bulmaJS.alert({
                message: 'No records are currently selected.',
                contextualColorName: 'warning'
            });
            return;
        }
        returnRecordsToPendingByRecordIds(selectedRecordIds);
    });
})();
