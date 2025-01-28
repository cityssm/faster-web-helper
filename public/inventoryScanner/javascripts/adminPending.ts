// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type {
  InventoryScannerRecord,
  WorkOrderValidationRecord
} from '../../../modules/inventoryScanner/types.js'

declare const exports: {
  itemRequestsCount: number
  refreshPendingRecordsFromExportEventName: string
  pendingRecords: InventoryScannerRecord[]
  fasterWorkOrderUrl: string
}

declare const bulmaJS: BulmaJS
declare const cityssm: cityssmGlobal
;(() => {
  const moduleUrlPrefix = `${document.querySelector('main')?.dataset.urlPrefix ?? ''}/modules/inventoryScanner`

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const fiveMinutesMillis = 5 * 60_000

  /*
   * Item Requests
   */

  const itemRequestsElement = document.querySelector('#itemRequests--column')

  let itemRequestsCount = exports.itemRequestsCount

  function renderItemRequests(): void {
    ;(itemRequestsElement?.querySelector('span') as HTMLElement).textContent =
      itemRequestsCount.toString()

    if (itemRequestsCount === 0) {
      itemRequestsElement?.classList.add('is-hidden')
    } else {
      itemRequestsElement?.classList.remove('is-hidden')
    }
  }

  function refreshItemRequests(): void {
    cityssm.postJSON(
      `${moduleUrlPrefix}/doGetItemRequestsCount`,
      {},
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as unknown as {
          itemRequestsCount: number
        }

        itemRequestsCount = responseJSON.itemRequestsCount

        renderItemRequests()
      }
    )
  }

  renderItemRequests()

  globalThis.setInterval(refreshItemRequests, fiveMinutesMillis)

  /*
   * Pending Scanner Records
   */

  let pendingRecords = exports.pendingRecords

  const pendingRecordsUnknownCountElement = document.querySelector(
    '#pending--unknownCount'
  ) as HTMLElement

  const pendingRecordsErrorCountElement = document.querySelector(
    '#pending--errorCount'
  ) as HTMLElement

  const pendingRecordsTbodyElement = document.querySelector(
    '#tbody--pending'
  ) as HTMLTableSectionElement

  const syncRecordsButtonElement = document.querySelector(
    '#pending--doSync'
  ) as HTMLButtonElement

  function unlockField(clickEvent: Event): void {
    clickEvent.preventDefault()

    const inputOrSelectElement = (clickEvent.currentTarget as HTMLElement)
      .closest('.field')
      ?.querySelector('input, select') as HTMLInputElement | HTMLSelectElement

    inputOrSelectElement.removeAttribute('readonly')

    if (inputOrSelectElement.tagName === 'SELECT') {
      const optionElements = inputOrSelectElement.querySelectorAll('option')

      for (const optionElement of optionElements) {
        optionElement.classList.remove('is-hidden')
        optionElement.disabled = false
      }
    }

    inputOrSelectElement.focus()
  }

  function renderRepairIds(records: WorkOrderValidationRecord[]): void {
    const repairIdSelectElement = document.querySelector(
      '#updatePending--repairId'
    ) as HTMLSelectElement | null

    if (repairIdSelectElement === null) {
      return
    }

    for (const record of records) {
      if (record.repairId !== null) {
        const optionElement = document.createElement('option')

        if (repairIdSelectElement.hasAttribute('readonly')) {
          optionElement.classList.add('is-hidden')
          optionElement.disabled = true
        }

        optionElement.textContent = record.repairDescription
        optionElement.value = record.repairId.toString()
        repairIdSelectElement.append(optionElement)
      }
    }
  }

  let lastSearchedWorkOrderNumber = ''

  function refreshRepairIdSelect(clearOptions = true): void {
    const workOrderNumberElement = document.querySelector(
      '#updatePending--workOrderNumber'
    ) as HTMLInputElement | null

    const repairIdSelectElement = document.querySelector(
      '#updatePending--repairId'
    ) as HTMLSelectElement | null

    if (
      workOrderNumberElement === null ||
      repairIdSelectElement === null ||
      lastSearchedWorkOrderNumber === workOrderNumberElement.value ||
      (clearOptions && workOrderNumberElement.readOnly)
    ) {
      return
    }

    lastSearchedWorkOrderNumber = workOrderNumberElement.value

    if (clearOptions) {
      repairIdSelectElement.replaceChildren()
      repairIdSelectElement.innerHTML =
        '<option value="">(Auto-Detect)</option>'
      repairIdSelectElement.value = ''
    }

    if (lastSearchedWorkOrderNumber === '') {
      renderRepairIds([])
      return
    }

    cityssm.postJSON(
      `${moduleUrlPrefix}/doGetRepairRecords`,
      {
        workOrderNumber: lastSearchedWorkOrderNumber
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as unknown as {
          records: WorkOrderValidationRecord[]
        }

        renderRepairIds(responseJSON.records)
      }
    )
  }

  function updatePendingRecord(
    formElement: HTMLFormElement,
    callbackFunction?: () => void
  ): void {
    cityssm.postJSON(
      `${moduleUrlPrefix}/doUpdatePendingRecord`,
      formElement,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as unknown as {
          success: boolean
          pendingRecords: InventoryScannerRecord[]
        }

        if (responseJSON.success) {
          pendingRecords = responseJSON.pendingRecords

          if (callbackFunction !== undefined) {
            callbackFunction()
          }

          renderPendingRecords()
        } else {
          bulmaJS.alert({
            title: 'Error Updating Record',
            message: 'Please try again.',
            contextualColorName: 'danger'
          })
        }
      }
    )
  }

  function deletePendingRecord(
    recordId: number,
    callbackFunction: () => void
  ): void {
    function doDelete(): void {
      cityssm.postJSON(
        `${moduleUrlPrefix}/doDeletePendingRecord`,
        {
          recordId
        },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as unknown as {
            success: boolean
            pendingRecords: InventoryScannerRecord[]
          }

          if (responseJSON.success) {
            pendingRecords = responseJSON.pendingRecords
            callbackFunction()
            renderPendingRecords()
          } else {
            bulmaJS.alert({
              title: 'Error Deleting Record',
              message: 'Please try again.',
              contextualColorName: 'danger'
            })
          }
        }
      )
    }

    bulmaJS.confirm({
      title: 'Delete Pending Record',
      message: 'Are you sure you want to delete this pending scanner record?',
      contextualColorName: 'warning',
      okButton: {
        text: 'Yes, Delete Record',
        callbackFunction: doDelete
      }
    })
  }

  function openUpdateScannerRecord(clickEvent: Event): void {
    clickEvent.preventDefault()

    const recordIndex = Number.parseInt(
      (clickEvent.currentTarget as HTMLElement).closest('tr')?.dataset
        .recordIndex ?? ''
    )

    lastSearchedWorkOrderNumber = ''

    // eslint-disable-next-line security/detect-object-injection
    const pendingRecord = pendingRecords[recordIndex]

    cityssm.openHtmlModal('scannerRecordEdit', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector(
            '#updatePending--recordId'
          ) as HTMLInputElement
        ).value = pendingRecord.recordId.toString()
        ;(
          modalElement.querySelector(
            '#updatePending--recordIdSpan'
          ) as HTMLElement
        ).textContent = pendingRecord.recordId.toString()
        ;(
          modalElement.querySelector(
            '#updatePending--scanDateTimeSpan'
          ) as HTMLElement
        ).textContent =
          `${pendingRecord.scanDateString} ${pendingRecord.scanTimeString}`
        ;(
          modalElement.querySelector(
            '#updatePending--workOrderNumber'
          ) as HTMLInputElement
        ).value = pendingRecord.workOrderNumber

        const repairSelectElement = modalElement.querySelector(
          '#updatePending--repairId'
        ) as HTMLSelectElement

        repairSelectElement.innerHTML = `<option value="${cityssm.escapeHTML(pendingRecord.repairId?.toString() ?? '')}">
          ${cityssm.escapeHTML(pendingRecord.repairId === null ? '(Auto-Detect)' : pendingRecord.repairDescription ?? `(Unknown Repair ID: ${pendingRecord.repairId})`)}
          </option>`
        ;(
          modalElement.querySelector(
            '#updatePending--itemNumber'
          ) as HTMLInputElement
        ).value = pendingRecord.itemNumber
        ;(
          modalElement.querySelector(
            '#updatePending--itemDescription'
          ) as HTMLInputElement
        ).value = pendingRecord.itemDescription ?? ''
        ;(
          modalElement.querySelector(
            '#updatePending--quantity'
          ) as HTMLInputElement
        ).value = pendingRecord.quantity.toString()
        ;(
          modalElement.querySelector(
            '#updatePending--unitPrice'
          ) as HTMLInputElement
        ).value =
          pendingRecord.unitPrice === null
            ? ''
            : pendingRecord.unitPrice.toPrecision(4)
      },
      onshown(modalElement, closeModalFunction) {
        bulmaJS.toggleHtmlClipped()
        bulmaJS.init(modalElement)

        modalElement
          .querySelector('form')
          ?.addEventListener('submit', (formEvent) => {
            formEvent.preventDefault()
            updatePendingRecord(
              formEvent.currentTarget as HTMLFormElement,
              closeModalFunction
            )
          })

        const unlockButtonElements =
          modalElement.querySelectorAll('.is-unlock-button')

        for (const unlockButtonElement of unlockButtonElements) {
          unlockButtonElement.addEventListener('click', unlockField)
        }

        modalElement
          .querySelector('#updatePending--workOrderNumber')
          ?.addEventListener('keyup', () => {
            refreshRepairIdSelect(true)
          })

        refreshRepairIdSelect(false)

        modalElement
          .querySelector('.is-delete-button')
          ?.addEventListener('click', (deleteClickEvent) => {
            deleteClickEvent.preventDefault()
            deletePendingRecord(pendingRecord.recordId, closeModalFunction)
          })
      },
      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  function recordHasUnknowns(record: InventoryScannerRecord): boolean {
    return (
      (record.workOrderType === 'faster' &&
        record.repairDescription === null) ||
      record.itemDescription === null ||
      record.unitPrice === null
    )
  }

  function recordHasErrors(record: InventoryScannerRecord): boolean {
    return record.workOrderType === 'faster' && record.quantity <= 0
  }

  function renderPendingRecords(): void {
    const rowElements: HTMLTableRowElement[] = []

    let unknownCount = 0
    let errorCount = 0

    for (const [recordIndex, record] of pendingRecords.entries()) {
      const rowElement = document.createElement('tr')

      if (recordHasErrors(record)) {
        errorCount += 1
      }

      if (recordHasUnknowns(record)) {
        unknownCount += 1
      }

      rowElement.dataset.recordId = record.recordId.toString()
      rowElement.dataset.recordIndex = recordIndex.toString()

      rowElement.innerHTML = `<td>
          ${cityssm.escapeHTML(record.scanDateString)} ${cityssm.escapeHTML(record.scanTimeString)}<br />
          <small title="Scanner Record ID">#${cityssm.escapeHTML(record.recordId.toString())}</small>
        </td>`

      const workOrderCellElement = document.createElement('td')

      // eslint-disable-next-line no-unsanitized/property
      workOrderCellElement.innerHTML =
        record.workOrderType === 'faster'
          ? `<a href="${exports.fasterWorkOrderUrl.replace('{workOrderNumber}', record.workOrderNumber)}"
              title="Open Work Order in FASTER Web"
              target="_blank">
              ${cityssm.escapeHTML(record.workOrderNumber)}
              </a>`
          : `${cityssm.escapeHTML(record.workOrderNumber)}<br />
              <small>${cityssm.escapeHTML(record.workOrderType)}</small>`

      rowElement.append(workOrderCellElement)

      const repairCellElement = document.createElement('td')

      if (
        record.workOrderType === 'faster' &&
        record.repairDescription === null
      ) {
        repairCellElement.classList.add('has-background-warning-light')
      }

      if (record.repairId === null) {
        repairCellElement.innerHTML = `<span
          class="${cityssm.escapeHTML(record.workOrderType === 'faster' ? 'has-text-weight-bold' : 'has-text-grey-dark')}">
          (No Repair Set)
          </span>`
      } else if (record.repairDescription === null) {
        repairCellElement.innerHTML = `<span class="has-text-weight-bold">
          (Unknown Repair ID: ${cityssm.escapeHTML(record.repairId.toString())})
          </span>`
      } else {
        repairCellElement.innerHTML = `${cityssm.escapeHTML(record.repairDescription)}<br />
          <small>Repair ID: ${cityssm.escapeHTML(record.repairId.toString())}</small>`
      }

      rowElement.append(repairCellElement)

      rowElement.insertAdjacentHTML(
        'beforeend',
        `<td>
          ${cityssm.escapeHTML(record.itemNumber)}<br />
          <small>${cityssm.escapeHTML(record.itemDescription ?? '(Unknown Item)')}</small>
        </td>`
      )

      const quantityCellElement = document.createElement('td')
      quantityCellElement.className = 'has-text-right'

      if (record.quantity <= 0) {
        quantityCellElement.classList.add('has-text-danger-dark')
      }

      if (record.workOrderType === 'faster' && record.quantity <= 0) {
        quantityCellElement.classList.add('has-background-danger-light')
      }

      quantityCellElement.textContent = record.quantity.toString()

      rowElement.append(quantityCellElement)

      const unitPriceCellElement = document.createElement('td')

      if (record.unitPrice === null) {
        unitPriceCellElement.classList.add(
          'has-background-warning-light',
          'has-text-weight-bold'
        )
        unitPriceCellElement.textContent = '(Unknown Price)'
      } else {
        unitPriceCellElement.classList.add('has-text-right')
        unitPriceCellElement.textContent = `$${record.unitPrice.toFixed(2)}`
      }

      rowElement.append(unitPriceCellElement)

      rowElement.insertAdjacentHTML(
        'beforeend',
        `<td class="has-text-centered">
          <button class="button" type="button" title="Record Options">
            <i class="fa-solid fa-gear" aria-hidden="true"></i>
          </button>
        </td>`
      )

      rowElement
        .querySelector('button')
        ?.addEventListener('click', openUpdateScannerRecord)

      rowElements.push(rowElement)
    }

    pendingRecordsTbodyElement.replaceChildren(...rowElements)

    if (errorCount === 0) {
      pendingRecordsErrorCountElement.classList.add('is-hidden')
      syncRecordsButtonElement.disabled = false
    } else {
      ;(
        pendingRecordsErrorCountElement.querySelector('span') as HTMLElement
      ).textContent = errorCount.toString()
      pendingRecordsErrorCountElement.classList.remove('is-hidden')
      syncRecordsButtonElement.disabled = true
    }

    if (unknownCount === 0) {
      pendingRecordsUnknownCountElement.classList.add('is-hidden')
    } else {
      ;(
        pendingRecordsUnknownCountElement.querySelector('span') as HTMLElement
      ).textContent = unknownCount.toString()
      pendingRecordsUnknownCountElement.classList.remove('is-hidden')
    }
  }

  const autoRefreshElement = document.querySelector(
    '#pending--autoRefresh'
  ) as HTMLInputElement

  function refreshPendingRecords(clickEvent?: Event): void {
    if (clickEvent !== undefined) {
      clickEvent.preventDefault()
      pendingRecordsTbodyElement.replaceChildren()
    }

    cityssm.postJSON(
      `${moduleUrlPrefix}/doGetPendingRecords`,
      {},
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as unknown as {
          pendingRecords: InventoryScannerRecord[]
        }

        pendingRecords = responseJSON.pendingRecords
        renderPendingRecords()
      }
    )
  }

  function autoRefreshPendingRecords(): void {
    if (autoRefreshElement.checked) {
      refreshPendingRecords()
    }
  }

  renderPendingRecords()

  globalThis.addEventListener(
    exports.refreshPendingRecordsFromExportEventName,
    () => {
      pendingRecords = exports.pendingRecords
      renderPendingRecords()
    }
  )

  document
    .querySelector('#pending--doRefresh')
    ?.addEventListener('click', refreshPendingRecords)

  globalThis.setInterval(autoRefreshPendingRecords, fiveMinutesMillis)

  function syncScannerRecords(): void {
    cityssm.postJSON(
      `${moduleUrlPrefix}/doSyncScannerRecords`,
      {},
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as unknown as {
          syncedRecordCount: number
          pendingRecords: InventoryScannerRecord[]
        }

        bulmaJS.alert({
          title: `${responseJSON.syncedRecordCount} Record(s) Marked for Syncing`,
          message:
            'The syncing process has started. The records should appear on their respective work orders shortly.',
          contextualColorName:
            responseJSON.syncedRecordCount === 0 ? 'info' : 'success'
        })

        pendingRecords = responseJSON.pendingRecords
        renderPendingRecords()
      }
    )
  }

  syncRecordsButtonElement.addEventListener('click', () => {
    bulmaJS.confirm({
      title: 'Sync Scanner Records',
      message:
        'Are you sure you are ready to sync all pending scanner records?',
      contextualColorName: 'warning',
      okButton: {
        text: 'Yes, Sync Pending Scanner Records',
        callbackFunction: syncScannerRecords
      }
    })
  })
})()
