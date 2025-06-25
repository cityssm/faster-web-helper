// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable max-lines */

import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { InventoryBatch } from '../../../modules/inventoryScanner/types.js'

declare const exports: {
  openBatch: InventoryBatch | undefined
}

declare const bulmaJS: BulmaJS
declare const cityssm: cityssmGlobal
;(() => {
  const moduleUrlPrefix = `${document.querySelector('main')?.dataset.urlPrefix ?? ''}/modules/inventoryScanner`

  let currentBatch: InventoryBatch | undefined = exports.openBatch

  const currentBatchButtonElement = document.querySelector(
    '#inventory--currentBatch'
  ) as HTMLButtonElement

  const currentBatchDetailsElement = document.querySelector(
    '#inventory--currentBatchDetails'
  ) as HTMLDivElement

  const currentBatchItemsContainerElement = document.querySelector(
    '#inventory--currentBatchItems'
  ) as HTMLDivElement

  const itemFormElement = document.querySelector(
    '#inventory--itemForm'
  ) as HTMLFormElement

  function confirmCloseBatch(): void {
    if (currentBatch === undefined) {
      return
    }

    function doCloseBatch(): void {
      cityssm.postJSON(
        `${moduleUrlPrefix}/doCloseInventoryBatch`,
        { batchId: currentBatch?.batchId },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean

            batch?: InventoryBatch
          }

          bulmaJS.alert({
            contextualColorName: responseJSON.success ? 'success' : 'danger',
            message: responseJSON.success
              ? 'The inventory batch has been closed.'
              : 'There was an error closing the inventory batch. Please try again.'
          })

          if (responseJSON.batch !== undefined) {
            currentBatch = responseJSON.batch
            renderCurrentBatch()
          }
        }
      )
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      message: 'Are you sure you want to close this inventory batch?',

      okButton: {
        callbackFunction: doCloseBatch,
        text: 'Close Batch'
      }
    })
  }

  function confirmReopenBatch(): void {
    if (currentBatch === undefined) {
      return
    }

    function doReopenBatch(): void {
      cityssm.postJSON(
        `${moduleUrlPrefix}/doReopenInventoryBatch`,
        { batchId: currentBatch?.batchId },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            batch?: InventoryBatch
          }

          bulmaJS.alert({
            contextualColorName: responseJSON.success ? 'success' : 'danger',
            message: responseJSON.success
              ? 'The inventory batch has been reopened.'
              : 'There was an error reopening the inventory batch. Please try again.'
          })
          if (responseJSON.batch !== undefined) {
            currentBatch = responseJSON.batch
            renderCurrentBatch()
          }
        }
      )
    }

    bulmaJS.confirm({
      contextualColorName: 'warning',
      message: 'Are you sure you want to reopen this inventory batch?',
      okButton: {
        text: 'Reopen Batch',
        callbackFunction: doReopenBatch
      }
    })
  }

  function confirmSyncBatch(): void {
    if (currentBatch === undefined) {
      return
    }

    function doSyncBatch(): void {
      cityssm.postJSON(
        `${moduleUrlPrefix}/doSyncInventoryBatch`,
        { batchId: currentBatch?.batchId },
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean
            batch?: InventoryBatch
          }

          bulmaJS.alert({
            contextualColorName: responseJSON.success ? 'success' : 'danger',
            message: responseJSON.success
              ? 'The inventory batch has been synced.'
              : 'There was an error syncing the inventory batch. Please try again.'
          })

          if (responseJSON.batch !== undefined) {
            currentBatch = responseJSON.batch
            renderCurrentBatch()
          }
        }
      )
    }
    bulmaJS.confirm({
      contextualColorName: 'warning',
      message: `Are you sure you want to sync this inventory batch?<br />
        Note that once a batch is synced, it cannot be reopened.`,
      messageIsHtml: true,
      okButton: {
        text: 'Sync Batch',
        callbackFunction: doSyncBatch
      }
    })
  }

  function updateCountedQuantity(formEvent: SubmitEvent): void {
    formEvent.preventDefault()

    const formElement = formEvent.currentTarget as HTMLFormElement

    const countedQuantityInputElement = formElement.querySelector(
      'input[name="countedQuantity"]'
    ) as HTMLInputElement

    let removeRow = false

    function doUpdate(): void {
      cityssm.postJSON(
        `${moduleUrlPrefix}/doRecordCountedQuantity`,
        formElement,
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            success: boolean

            message: string
          }

          bulmaJS.alert({
            message: responseJSON.message,

            contextualColorName: responseJSON.success ? 'success' : 'danger'
          })

          const rowElement = countedQuantityInputElement.closest(
            'tr'
          ) as HTMLTableRowElement

          if (responseJSON.success) {
            if (removeRow) {
              rowElement.remove()
            } else {
              rowElement.classList.remove('is-warning')
            }

            if (
              currentBatchItemsContainerElement.querySelectorAll(
                'tbody tr.is-warning'
              ).length === 0
            ) {
              itemFormElement
                .querySelector('fieldset')
                ?.removeAttribute('disabled')
            }
          }
        }
      )
    }

    if (countedQuantityInputElement.value.trim() === '') {
      removeRow = itemsToIncludeSelectElement.value === 'counted'

      bulmaJS.confirm({
        contextualColorName: 'warning',
        message:
          'Are you sure you want to delete this counted quantity from the batch?',

        okButton: {
          text: 'Delete Counted Quantity',
          callbackFunction: doUpdate
        }
      })
    } else {
      doUpdate()
    }
  }

  function highlightUpdatedRow(keyboardEvent: KeyboardEvent): void {
    const targetElement = keyboardEvent.currentTarget as HTMLInputElement
    targetElement.closest('tr')?.classList.add('is-warning')

    itemFormElement.querySelector('fieldset')?.setAttribute('disabled', 'true')
  }

  /*
   * Render Batches
   */

  const itemsToIncludeSelectElement = itemFormElement.querySelector(
    '#inventory--itemsToInclude'
  ) as HTMLSelectElement

  const itemNumberFilterTypeSelectElement = itemFormElement.querySelector(
    '#inventory--itemNumberFilterType'
  ) as HTMLSelectElement

  const itemNumberFilterElement = itemFormElement.querySelector(
    '#inventory--itemNumberFilter'
  ) as HTMLInputElement

  function renderUndefinedBatch(): void {
    currentBatchButtonElement.value = '(No Batch Selected)'
    currentBatchDetailsElement.replaceChildren()

    currentBatchItemsContainerElement.innerHTML = `<div class="message is-info">
      <p class="message-body">No inventory batch has been selected.</p>
      </div>`
  }

  // eslint-disable-next-line complexity
  function renderCurrentBatch(): void {
    if (currentBatch === undefined) {
      renderUndefinedBatch()
      return
    }

    /*
     * Render Button
     */

    currentBatchButtonElement.value = `Batch #${currentBatch.batchId}`

    /*
     * Render Details
     */

    currentBatchDetailsElement.innerHTML = `<p class="mb-4">
        <strong>Open Date</strong><br />
        ${cityssm.escapeHTML(currentBatch.openDateString)}
        ${cityssm.escapeHTML(currentBatch.openTimeString)}
      </p>`

    if (currentBatch.closeDate === null) {
      currentBatchDetailsElement.insertAdjacentHTML(
        'beforeend',
        `<p>
          <button class="button is-warning is-fullwidth" id="inventory--closeBatchButton" type="button">
            <span class="icon"><i class="fas fa-stop" aria-hidden="true"></i></span>
            <span>Close Batch</span>
          </button>
          </p>`
      )

      currentBatchDetailsElement
        .querySelector('#inventory--closeBatchButton')
        ?.addEventListener('click', confirmCloseBatch)
    } else {
      currentBatchDetailsElement.insertAdjacentHTML(
        'beforeend',
        `<p class="mb-4">
          <strong>Close Date</strong><br />
          ${cityssm.escapeHTML(currentBatch.closeDateString ?? '')}
          ${cityssm.escapeHTML(currentBatch.closeTimeString ?? '')}
          </p>`
      )

      if (currentBatch.recordSync_timeMillis === null) {
        currentBatchDetailsElement.insertAdjacentHTML(
          'beforeend',
          `<div class="columns">
            <div class="column">
              <button class="button is-success is-fullwidth" id="inventory--syncBatchButton" type="button">
                <span class="icon"><i class="fas fa-sync" aria-hidden="true"></i></span>
                <span>Sync Batch</span>
              </button>
            </div>
            <div class="column">
              <button class="button is-warning is-fullwidth" id="inventory--reopenBatchButton" type="button">
                <span class="icon"><i class="fas fa-rotate-left" aria-hidden="true"></i></span>
                <span>Reopen Batch</span>
              </button>
            </div>
          </div>`
        )

        currentBatchDetailsElement
          .querySelector('#inventory--syncBatchButton')
          ?.addEventListener('click', confirmSyncBatch)

        currentBatchDetailsElement
          .querySelector('#inventory--reopenBatchButton')
          ?.addEventListener('click', confirmReopenBatch)
      }
    }

    if (currentBatch.recordSync_userName !== null) {
      currentBatchDetailsElement.insertAdjacentHTML(
        'beforeend',
        `<p class="mt-4">
          <strong>Synced</strong>
          </p>`
      )
    }

    /*
     * Render Items
     */

    itemFormElement.querySelector('fieldset')?.removeAttribute('disabled')

    if (
      currentBatch.batchItems === undefined ||
      currentBatch.batchItems.length === 0
    ) {
      currentBatchItemsContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no items in this batch.</p>
        </div>`
      return
    }

    const tableElement = document.createElement('table')
    tableElement.className = 'table is-fullwidth is-striped is-hoverable'

    // eslint-disable-next-line no-unsanitized/property
    tableElement.innerHTML = `<thead>
        <tr>
          <th>Storeroom</th>
          <th>Item Number</th>
          <th class="has-text-right">Counted Quantity</th>
          ${currentBatch.closeDate === null ? '<th class="has-width-1"></th>' : ''}
        </tr>
      </thead>
      <tbody></tbody>`

    const tbodyElement = tableElement.querySelector(
      'tbody'
    ) as HTMLTableSectionElement

    for (const batchItem of currentBatch.batchItems) {
      const rowElement = document.createElement('tr')

      rowElement.innerHTML = `<td>
          ${cityssm.escapeHTML(batchItem.itemStoreroom)}
        </td>
        <td>
          ${cityssm.escapeHTML(batchItem.itemNumber)}<br />
          <span class="is-size-7">${cityssm.escapeHTML(batchItem.itemDescription ?? '')}</span>
        </td>`

      if (currentBatch.closeDate === null) {
        rowElement.insertAdjacentHTML(
          'beforeend',
          `<td class="has-text-right">
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
                    value="${cityssm.escapeHTML(batchItem.countedQuantity?.toString() ?? '')}" />
                </div>
                <div class="control">
                  <button class="button" type="submit" title="Update Counted Quantity" tabindex="-1">
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
                  title="Delete Item from Batch"
                  tabindex="-1">
                  <span class="icon"><i class="fas fa-trash" aria-hidden="true"></i></span>
                </button>
              </form>
            </td>`
        )

        rowElement
          .querySelector('.is-update-form')
          ?.addEventListener('submit', updateCountedQuantity)

        rowElement
          .querySelector('.is-delete-form')
          ?.addEventListener('submit', updateCountedQuantity)

        rowElement
          .querySelector('.is-update-form input[name="countedQuantity"]')
          ?.addEventListener('change', highlightUpdatedRow)
      } else {
        rowElement.insertAdjacentHTML(
          'beforeend',
          `<td class="has-text-right">
              ${cityssm.escapeHTML(batchItem.countedQuantity?.toString() ?? '')}
            </td>`
        )
      }

      tbodyElement.append(rowElement)
    }

    currentBatchItemsContainerElement.replaceChildren(tableElement)
  }

  renderCurrentBatch()

  function getBatchByBatchId(
    batchId: number,
    callbackFunction?: () => void
  ): void {
    currentBatchItemsContainerElement.innerHTML = `<div class="message is-info">
      <p class="message-body">Loading batch items...</p>
      </div>`

    cityssm.postJSON(
      `${moduleUrlPrefix}/doGetInventoryBatch`,
      {
        batchId,

        itemsToInclude: itemsToIncludeSelectElement.value,

        itemNumberFilter: itemNumberFilterElement.value,
        itemNumberFilterType: itemNumberFilterTypeSelectElement.value
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as {
          batch: InventoryBatch
        }

        currentBatch = responseJSON.batch

        callbackFunction?.()
        renderCurrentBatch()
      }
    )
  }

  function reloadCurrentBatch(): void {
    if (currentBatch === undefined) {
      renderUndefinedBatch()
      return
    }

    getBatchByBatchId(currentBatch.batchId, renderCurrentBatch)
  }

  itemFormElement.addEventListener('submit', (formEvent) => {
    formEvent.preventDefault()
  })

  itemsToIncludeSelectElement.addEventListener('change', reloadCurrentBatch)
  itemNumberFilterTypeSelectElement.addEventListener(
    'change',
    reloadCurrentBatch
  )
  itemNumberFilterElement.addEventListener('change', reloadCurrentBatch)

  /*
   * Batch Select
   */

  function openSelectBatchModal(): void {
    let modalElement: HTMLElement | undefined
    let closeModalFunction: (() => void) | undefined

    function selectBatch(clickEvent: MouseEvent): void {
      clickEvent.preventDefault()

      const targetElement = clickEvent.currentTarget as HTMLAnchorElement

      const batchId = Number.parseInt(targetElement.dataset.batchId ?? '', 10)

      itemFormElement.reset()
      getBatchByBatchId(batchId, closeModalFunction)
    }

    function openNewBatch(): void {
      itemFormElement.reset()
      
      cityssm.postJSON(
        `${moduleUrlPrefix}/doOpenNewInventoryBatch`,
        {},
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            batch: InventoryBatch
          }

          currentBatch = responseJSON.batch

          closeModalFunction?.()
          renderCurrentBatch()
        }
      )
    }

    function getAvailableInventoryBatches(): void {
      if (modalElement === undefined) {
        return
      }

      cityssm.postJSON(
        `${moduleUrlPrefix}/doGetAvailableInventoryBatches`,
        {},
        (rawResponseJSON) => {
          const responseJSON = rawResponseJSON as {
            inventoryBatches: InventoryBatch[]
          }

          const containerElement = modalElement?.querySelector(
            '#container--inventoryBatchSelect'
          ) as HTMLDivElement

          containerElement.replaceChildren()

          let hasOpenBatch = false

          if (responseJSON.inventoryBatches.length === 0) {
            containerElement.innerHTML =
              '<div class="message is-info">' +
              '<p class="message-body">There are no inventory batches available.</p>' +
              '</div>'
          } else {
            const panelElement = document.createElement('div')
            panelElement.className = 'panel'

            for (const inventoryBatch of responseJSON.inventoryBatches) {
              const panelBlockElement = document.createElement('a')
              panelBlockElement.className = 'panel-block is-block'
              panelBlockElement.href = '#'
              panelBlockElement.dataset.batchId =
                inventoryBatch.batchId.toString()

              let statusTagHtml = `<span class="tag is-success">
                <span class="icon"><i class="fas fa-play" aria-hidden="true"></i></span>
                <span>Open</span>
                </span>`

              if (inventoryBatch.closeDate !== null) {
                statusTagHtml = `<span class="tag is-danger">
                  <span class="icon"><i class="fas fa-stop" aria-hidden="true"></i></span>
                  <span>Closed</span>
                  </span>`
              }

              if (inventoryBatch.recordSync_timeMillis !== null) {
                statusTagHtml = `<span class="tag is-success" title="Synced">
                  <span class="icon"><i class="fas fa-sync" aria-hidden="true"></i></span>
                  <span>Synced</span>
                  </span>`
              }

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
                        ${(inventoryBatch.batchItemCount ?? 0).toLocaleString()}
                      </span>
                      ${statusTagHtml}
                    </div>
                  </div>
                </div>`

              panelBlockElement.addEventListener('click', selectBatch)

              panelElement.append(panelBlockElement)

              if (inventoryBatch.closeDate === null) {
                hasOpenBatch = true
              }
            }

            containerElement.append(panelElement)
          }

          if (!hasOpenBatch) {
            const openBatchElement = document.createElement('button')
            openBatchElement.className = 'button is-success is-fullwidth mb-4'
            openBatchElement.type = 'button'
            openBatchElement.innerHTML = `<span class="icon">
                  <i class="fas fa-plus" aria-hidden="true"></i>
                </span>
                <span>Create New Inventory Batch</span>`

            openBatchElement.addEventListener('click', openNewBatch)

            containerElement.prepend(openBatchElement)
          }
        }
      )
    }

    cityssm.openHtmlModal('inventoryBatchSelect', {
      onshown(_modalElement, _closeModalFunction) {
        modalElement = _modalElement
        closeModalFunction = _closeModalFunction

        bulmaJS.toggleHtmlClipped()

        getAvailableInventoryBatches()
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  currentBatchButtonElement.addEventListener('click', openSelectBatchModal)
})()
