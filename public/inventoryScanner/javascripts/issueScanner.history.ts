import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { InventoryScannerRecord } from '../../../modules/inventoryScanner/types.js'

declare const exports: {
  renderScannerHistoryEventName: string
  scannerHistory: InventoryScannerRecord[]
}

declare const bulmaJS: BulmaJS
declare const cityssm: cityssmGlobal

;(() => {
  const scannerUrlPrefix = `${document.querySelector('main')?.dataset.urlPrefix ?? ''}/apps/inventoryScanner`

  const scannerKey = globalThis.localStorage.getItem('scannerKey')

  /*
   * History
   */

  const historyContainerElement = document.querySelector(
    '#history--container'
  ) as HTMLElement

  function toggleHistoryViewMore(clickEvent: Event): void {
    clickEvent.preventDefault()
    ;(clickEvent.currentTarget as HTMLElement)
      .closest('.panel-block')
      ?.querySelector('.is-view-more-container')
      ?.classList.toggle('is-hidden')
  }

  function doDeleteScannerRecord(recordId: string): void {
    cityssm.postJSON(
      `${scannerUrlPrefix}/doDeleteScannerRecord`,
      {
        recordId,
        scannerKey
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as unknown as {
          success: boolean
          records: InventoryScannerRecord[]
        }

        if (responseJSON.success) {
          exports.scannerHistory = responseJSON.records
          renderScannerHistory()
        } else {
          bulmaJS.alert({
            title: 'Error Deleting Record',
            message: 'If the problem persists, try the admin interface.',
            contextualColorName: 'danger'
          })
        }
      }
    )
  }

  function confirmDeleteScannerRecord(clickEvent: Event): void {
    clickEvent.preventDefault()
    const buttonElement = clickEvent.currentTarget as HTMLElement

    bulmaJS.confirm({
      title: 'Delete Scanner Record',
      message: 'Are you sure you want to delete this scanner record?',
      contextualColorName: 'warning',
      okButton: {
        text: 'Yes, Delete Record',
        callbackFunction: () => {
          const recordId =
            (buttonElement.closest('.panel-block') as HTMLElement).dataset
              .recordId ?? ''

          doDeleteScannerRecord(recordId)
        }
      }
    })
  }

  function renderScannerHistory(): void {
    if (exports.scannerHistory.length === 0) {
      historyContainerElement.replaceChildren()
      historyContainerElement.innerHTML = `<div class="message is-info">
          <p class="message-body">There are no recent scans for this scanner.</p>
          </div>`

      return
    }

    const panelElement = document.createElement('div')
    panelElement.className = 'panel'

    for (const record of exports.scannerHistory) {
      const panelBlockElement = document.createElement('div')
      panelBlockElement.className = 'panel-block is-block'
      panelBlockElement.dataset.recordId = record.recordId.toString()

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
              ${
                record.itemNumberPrefix === ''
                  ? ''
                  : `<span class="tag">${cityssm.escapeHTML(record.itemNumberPrefix)}</span> -`
              }
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
                ${
                  record.itemNumberPrefix === ''
                    ? ''
                    : `<span class="tag">${cityssm.escapeHTML(record.itemNumberPrefix)}</span> -`
                }
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
              ${
                record.recordSync_timeMillis === null
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
                      </div>`
              }
              </div>
            </div>
          </div>`

      if (record.repairId !== null || record.repairDescription !== null) {
        panelBlockElement.querySelector('.repairContainer')?.insertAdjacentHTML(
          'beforeend',
          `${cityssm.escapeHTML(record.repairDescription ?? '')}
              (${cityssm.escapeHTML(record.repairId === null ? '' : record.repairId.toString())})`
        )
      }

      panelBlockElement
        .querySelector('.is-view-more-button')
        ?.addEventListener('click', toggleHistoryViewMore)

      panelBlockElement
        .querySelector('.is-delete-button')
        ?.addEventListener('click', confirmDeleteScannerRecord)

      panelElement.append(panelBlockElement)
    }

    historyContainerElement.replaceChildren(panelElement)
  }

  function refreshScannerHistory(): void {
    cityssm.postJSON(
      `${scannerUrlPrefix}/doGetScannerRecords`,
      {
        scannerKey
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as unknown as {
          records: InventoryScannerRecord[]
        }

        exports.scannerHistory = responseJSON.records
        renderScannerHistory()
      }
    )
  }

  // Ensure the scanner is initialized before retrieving the history
  globalThis.setTimeout(refreshScannerHistory, 500)

  globalThis.addEventListener(exports.renderScannerHistoryEventName, () => {
    renderScannerHistory()
  })
})()
