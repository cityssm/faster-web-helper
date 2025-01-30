import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type {
  InventoryScannerRecord,
  WorkOrderValidationRecord
} from '../../../modules/inventoryScanner/types.js'

declare const bulmaJS: BulmaJS
declare const cityssm: cityssmGlobal
;(() => {
  const scannerUrlPrefix = `${document.querySelector('main')?.dataset.urlPrefix ?? ''}/apps/inventoryScanner`

  const formElement = document.querySelector(
    '#form--scanner'
  ) as HTMLFormElement

  const successMessageElement = document.querySelector(
    '#scanner--successMessage'
  ) as HTMLElement

  function hideSuccessMessage(): void {
    successMessageElement.classList.add('is-hidden')
  }

  /*
   * Scanner Key
   */

  let scannerKey = globalThis.localStorage.getItem('scannerKey')

  if (scannerKey === null) {
    // eslint-disable-next-line sonarjs/pseudo-random, @typescript-eslint/no-magic-numbers
    scannerKey = Math.random().toString(36).slice(2, 10)
    globalThis.localStorage.setItem('scannerKey', scannerKey)
  }

  ;(
    formElement.querySelector('#scanner--scannerKey') as HTMLInputElement
  ).value = scannerKey
  ;(document.querySelector('#about--scannerKey') as HTMLElement).textContent =
    scannerKey

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
          renderHistory(responseJSON.records)
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

  function renderHistory(scannerRecords: InventoryScannerRecord[]): void {
    if (scannerRecords.length === 0) {
      historyContainerElement.replaceChildren()
      historyContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no recent scans for this scanner.</p>
        </div>`

      return
    }

    const panelElement = document.createElement('div')
    panelElement.className = 'panel'

    for (const record of scannerRecords) {
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

  function refreshHistory(): void {
    cityssm.postJSON(
      `${scannerUrlPrefix}/doGetScannerRecords`,
      {
        scannerKey
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as unknown as {
          records: InventoryScannerRecord[]
        }

        renderHistory(responseJSON.records)
      }
    )
  }

  // Ensure the scanner is initialized before retrieving the history
  globalThis.setTimeout(refreshHistory, 500)

  /*
   * Repair refresh
   */

  const workOrderNumberInputElement = formElement.querySelector(
    '#scanner--workOrderNumber'
  ) as HTMLInputElement

  const workOrderNumberValidateIconElement = formElement.querySelector(
    '#scanner--workOrderNumber-validateIcon'
  ) as HTMLElement

  let lastSearchedWorkOrderNumber = ''

  const repairIdSelectElement = formElement.querySelector(
    '#scanner--repairId'
  ) as HTMLSelectElement

  function renderRepairIds(records: WorkOrderValidationRecord[]): void {
    for (const record of records) {
      if (record.repairId !== null) {
        const optionElement = document.createElement('option')
        optionElement.textContent = record.repairDescription
        optionElement.value = record.repairId.toString()
        repairIdSelectElement.append(optionElement)
      }
    }
  }

  function refreshRepairIdSelect(): void {
    if (lastSearchedWorkOrderNumber === workOrderNumberInputElement.value) {
      return
    }

    hideSuccessMessage()

    lastSearchedWorkOrderNumber = workOrderNumberInputElement.value

    repairIdSelectElement.replaceChildren()
    repairIdSelectElement.innerHTML = '<option value="">(Auto-Detect)</option>'
    repairIdSelectElement.value = ''

    if (!workOrderNumberInputElement.checkValidity()) {
      workOrderNumberValidateIconElement.replaceChildren()

      if (lastSearchedWorkOrderNumber === '') {
        workOrderNumberValidateIconElement.insertAdjacentHTML(
          'beforeend',
          '<i class="fa-solid fa-question-circle has-text-info" aria-hidden="true"></i>'
        )

        workOrderNumberValidateIconElement.title = 'Work Order Required'
      } else {
        workOrderNumberValidateIconElement.insertAdjacentHTML(
          'beforeend',
          '<i class="fa-solid fa-exclamation-triangle has-text-warning" aria-hidden="true"></i>'
        )

        workOrderNumberValidateIconElement.title = 'Invalid Work Order Format'
      }

      renderRepairIds([])
      return
    }

    cityssm.postJSON(
      `${scannerUrlPrefix}/doGetRepairRecords`,
      {
        workOrderNumber: lastSearchedWorkOrderNumber
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as unknown as {
          records: WorkOrderValidationRecord[]
        }

        workOrderNumberValidateIconElement.replaceChildren()

        if (responseJSON.records.length === 0) {
          workOrderNumberValidateIconElement.insertAdjacentHTML(
            'beforeend',
            '<i class="fa-solid fa-question-circle has-text-warning" aria-hidden="true"></i>'
          )

          workOrderNumberValidateIconElement.title = 'Unknown Work Order'
        } else {
          workOrderNumberValidateIconElement.insertAdjacentHTML(
            'beforeend',
            '<i class="fa-solid fa-check has-text-success" aria-hidden="true"></i>'
          )

          workOrderNumberValidateIconElement.title = 'Valid Work Order'
        }

        renderRepairIds(responseJSON.records)
      }
    )
  }

  refreshRepairIdSelect()

  workOrderNumberInputElement.addEventListener('keyup', refreshRepairIdSelect)

  /*
   * Item Type Toggle
   */

  const itemTypeTabElements = document.querySelectorAll(
    '#scanner--itemTypeTabs a'
  ) as NodeListOf<HTMLAnchorElement>

  const itemNumberSuffixElement = formElement.querySelector('#scanner--itemNumberSuffix') as HTMLInputElement

  const itemDescriptionElement = formElement.querySelector('#scanner--itemDescription') as HTMLInputElement

  const unitPriceElement = formElement.querySelector('#scanner--unitPrice') as HTMLInputElement

  function toggleItemTypeFieldsets(): void {
    for (const itemTypeTabElement of itemTypeTabElements) {
      const tabIsActive =
        itemTypeTabElement.closest('li')?.classList.contains('is-active') ??
        false

      ;(
        document.querySelector(
          `#itemTypeTab--${itemTypeTabElement.dataset.itemType ?? ''} fieldset`
        ) as HTMLFieldSetElement
      ).disabled = !tabIsActive

      if (tabIsActive) {
        ;(
          document.querySelector('#scanner--itemType') as HTMLInputElement
        ).value = itemTypeTabElement.dataset.itemType ?? ''
      }
    }
  }

  toggleItemTypeFieldsets()

  for (const itemTypeTabElement of itemTypeTabElements) {
    itemTypeTabElement.addEventListener('click', toggleItemTypeFieldsets)
  }

  /*
   * Quantity Multiplier
   */

  const quantityLabelElement = formElement.querySelector(
    'label[for="scanner--quantity"]'
  ) as HTMLElement

  const quantityMultiplierElement = formElement.querySelector(
    '#scanner--quantityMultiplier'
  ) as HTMLInputElement

  const quantityMultiplierToggleElement = formElement.querySelector(
    '#is-toggle-quantity-multiplier'
  ) as HTMLButtonElement

  const quantityElement = formElement.querySelector(
    '#scanner--quantity'
  ) as HTMLInputElement

  const submitButtonElement = formElement.querySelector(
    'button[type="submit"]'
  ) as HTMLButtonElement

  function renderQuantityMultiplier(): void {
    if (quantityMultiplierElement.value === '1') {
      quantityLabelElement.textContent = 'Issue Quantity'
      quantityMultiplierToggleElement.innerHTML =
        '<span class="icon"><i class="fa-solid fa-plus" aria-hidden="true"></i></span>'
      submitButtonElement.textContent = 'Issue Item(s)'
    } else {
      quantityLabelElement.textContent = 'Return Quantity'
      quantityMultiplierToggleElement.innerHTML =
        '<span class="icon"><i class="fa-solid fa-minus" aria-hidden="true"></i></span>'
      submitButtonElement.textContent = 'Return Item(s)'
    }
  }

  quantityMultiplierToggleElement.addEventListener('click', () => {
    quantityMultiplierElement.value =
      quantityMultiplierElement.value === '1' ? '-1' : '1'
    renderQuantityMultiplier()
  })

  quantityMultiplierElement.value = '1'
  renderQuantityMultiplier()

  /*
   * Clear buttons
   */

  function clearFieldAndFocus(event: Event): void {
    event.preventDefault()

    const inputElement = (event.currentTarget as HTMLElement)
      .closest('.field')
      ?.querySelector('input, select') as HTMLInputElement | HTMLSelectElement

    inputElement.value = ''

    if (inputElement.name === workOrderNumberInputElement.name) {
      refreshRepairIdSelect()
    }

    inputElement.focus()
  }

  const clearButtonElements = formElement.querySelectorAll(
    'button.is-clear-button'
  )

  for (const clearButtonElement of clearButtonElements) {
    clearButtonElement.addEventListener('click', clearFieldAndFocus)
  }

  /*
   * Form submit
   */

  const itemNumberElement = formElement.querySelector(
    '#scanner--itemNumber'
  ) as HTMLInputElement

  function blockInputSubmit(inputEvent: KeyboardEvent): void {
    if (inputEvent.key === 'Enter') {
      inputEvent.preventDefault()
      inputEvent.stopPropagation()
    }
  }

  workOrderNumberInputElement.addEventListener('keypress', blockInputSubmit)
  itemNumberElement.addEventListener('keypress', blockInputSubmit)

  formElement.addEventListener('submit', (formEvent) => {
    formEvent.preventDefault()

    if (!formElement.checkValidity()) {
      return
    }

    if (quantityElement.value === '0') {
      quantityElement.focus()
      return
    }

    cityssm.postJSON(
      `${scannerUrlPrefix}/doCreateScannerRecord`,
      formElement,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as unknown as {
          success: boolean
          records: InventoryScannerRecord[]
        }

        if (responseJSON.success) {
          successMessageElement.classList.remove('is-hidden')
          globalThis.setTimeout(hideSuccessMessage, 1000)

          quantityMultiplierElement.value = '1'
          renderQuantityMultiplier()

          quantityElement.value = '1'

          itemNumberSuffixElement.value = ''
          itemDescriptionElement.value = ''
          unitPriceElement.value = ''

          itemTypeTabElements[0].click()

          itemNumberElement.value = ''
          itemNumberElement.focus()

          renderHistory(responseJSON.records)
        } else {
          bulmaJS.alert({
            title: 'Error Recording Scan',
            message: 'Please try again.',
            contextualColorName: 'danger'
          })
        }
      }
    )
  })
})()
