import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type {
  InventoryScannerRecord,
  WorkOrderValidationRecord
} from '../../../modules/inventoryScanner/types.js'

declare const exports: {
  renderScannerHistoryEventName: string
  scannerHistory: InventoryScannerRecord[]
}

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
    scannerKey = Math.random().toString(36).slice(2, 10).toUpperCase()
    globalThis.localStorage.setItem('scannerKey', scannerKey)
  }

  ;(
    formElement.querySelector('#scanner--scannerKey') as HTMLInputElement
  ).value = scannerKey
  ;(document.querySelector('#about--scannerKey') as HTMLElement).textContent =
    scannerKey

  /*
   * Repair refresh
   */

  const workOrderNumberInputElement = formElement.querySelector(
    '#scanner--workOrderNumber'
  ) as HTMLInputElement

  const workOrderNumberValidateIconElement = formElement.querySelector(
    '#scanner--workOrderNumber-validateIcon'
  ) as HTMLElement

  const itemNumberElement = formElement.querySelector(
    '#scanner--itemNumber'
  ) as HTMLInputElement

  const itemNumberSuffixElement = formElement.querySelector(
    '#scanner--itemNumberSuffix'
  ) as HTMLInputElement

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

  function jumpToItemNumberInput(inputEvent: KeyboardEvent): void {
    if (inputEvent.key === 'Enter') {
      inputEvent.preventDefault()
      inputEvent.stopPropagation()

      if (workOrderNumberInputElement.validity.valid) {
        itemNumberElement.focus()

        if (document.activeElement !== itemNumberElement) {
          itemNumberSuffixElement.focus()
        }
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

  workOrderNumberInputElement.addEventListener(
    'keypress',
    jumpToItemNumberInput
  )

  /*
   * Item Type Toggle
   */

  const itemTypeTabElements: NodeListOf<HTMLAnchorElement> =
    document.querySelectorAll('#scanner--itemTypeTabs a')

  const itemDescriptionElement = formElement.querySelector(
    '#scanner--itemDescription'
  ) as HTMLInputElement

  const unitPriceElement = formElement.querySelector(
    '#scanner--unitPrice'
  ) as HTMLInputElement

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
   * Item Number
   */

  const quantityElement = formElement.querySelector(
    '#scanner--quantity'
  ) as HTMLInputElement

  function jumpToQuantityInput(inputEvent: KeyboardEvent): void {
    if (inputEvent.key === 'Enter') {
      inputEvent.preventDefault()
      inputEvent.stopPropagation()

      if (itemNumberElement.validity.valid) {
        quantityElement.focus()
      }
    }
  }

  itemNumberElement.addEventListener('keypress', jumpToQuantityInput)

  /*
   * Item Description
   */

  let lastSearchedItemNumber = ''

  const itemDescriptionSpanElement = formElement.querySelector(
    '#scanner--itemDescriptionSpan'
  ) as HTMLElement

  const unitPriceSpanElement = formElement.querySelector(
    '#scanner--unitPriceSpan'
  ) as HTMLElement

  function refreshItemDescription(): void {
    const itemNumber = itemNumberElement.value

    if (itemNumber === '') {
      itemDescriptionSpanElement.textContent = '(No Item Number Entered)'
      unitPriceSpanElement.textContent = ''
      return
    } else if (!itemNumberElement.checkValidity()) {
      itemDescriptionSpanElement.textContent = '(Item Number Invalid)'
      unitPriceSpanElement.textContent = ''
      return
    } else if (itemNumber === lastSearchedItemNumber) {
      return
    }

    lastSearchedItemNumber = itemNumber

    cityssm.postJSON(
      `${scannerUrlPrefix}/doGetItemDescription`,
      {
        itemNumber
      },
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as unknown as {
          itemDescription: string
          unitPrice?: number
        }

        itemDescriptionSpanElement.textContent = responseJSON.itemDescription
        unitPriceSpanElement.textContent =
          responseJSON.unitPrice === undefined
            ? ''
            : `$${responseJSON.unitPrice.toFixed(2)}`
      }
    )
  }

  refreshItemDescription()

  itemNumberElement.addEventListener('keyup', refreshItemDescription)

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
          refreshItemDescription()

          itemNumberElement.focus()

          exports.scannerHistory = responseJSON.records
          globalThis.dispatchEvent(
            new Event(exports.renderScannerHistoryEventName)
          )
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error Recording Scan',

            message: 'Please try again.'
          })
        }
      }
    )
  })
})()
