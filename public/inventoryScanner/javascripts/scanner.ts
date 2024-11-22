import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { WorkOrderValidationRecord } from '../../../modules/inventoryScanner/types.js'

declare const bulmaJS: BulmaJS
declare const cityssm: cityssmGlobal
;(() => {
  const scannerUrlPrefix =
    (document.querySelector('main')?.dataset.urlPrefix ?? '') +
    '/apps/inventoryScanner'

  const formElement = document.querySelector(
    '#form--scanner'
  ) as HTMLFormElement

  /*
   * Scanner Key
   */

  let scannerKey = globalThis.localStorage.getItem('scannerKey')

  if (scannerKey === null) {
    scannerKey = crypto.randomUUID().slice(-10)
    globalThis.localStorage.setItem('scannerKey', scannerKey)
  }

  ;(formElement.querySelector('#scanner--scannerKey') as HTMLInputElement).value =
    scannerKey

  /*
   * Repair refresh
   */

  const workOrderNumberInputElement = formElement.querySelector(
    '#scanner--workOrderNumber'
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

  function refreshRepairIdSelect(): void {
    if (lastSearchedWorkOrderNumber === workOrderNumberInputElement.value) {
      return
    }

    lastSearchedWorkOrderNumber = workOrderNumberInputElement.value

    if (lastSearchedWorkOrderNumber === '') {
      renderRepairIds([])
      return
    }

    repairIdSelectElement.replaceChildren()
    repairIdSelectElement.innerHTML = '<option value="">(Auto-Detect)</option>'
    repairIdSelectElement.value = ''

    cityssm.postJSON(
      `${scannerUrlPrefix}/doGetRepairRecords`,
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

  refreshRepairIdSelect()

  workOrderNumberInputElement.addEventListener('keyup', refreshRepairIdSelect)

  /*
   * Clear buttons
   */

  function clearFieldAndFocus(event: Event): void {
    event.preventDefault()

    const inputElement = (event.currentTarget as HTMLElement)
      .closest('.field')
      ?.querySelector('input, select') as HTMLInputElement | HTMLSelectElement

    inputElement.value = ''

    if (inputElement.name === 'workOrderNumber') {
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

  const itemNumberElement = formElement.querySelector('#scanner--itemNumber') as HTMLInputElement
  const quantityElement = formElement.querySelector('#scanner--quantity') as HTMLInputElement

  formElement.addEventListener('submit', (formEvent) => {
    formEvent.preventDefault()

    cityssm.postJSON(
      `${scannerUrlPrefix}/doCreateScannerRecord`,
      formEvent.currentTarget,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as unknown as {
          success: boolean
        }

        if (responseJSON.success) {
          quantityElement.value = '1'
          itemNumberElement.value = ''
          itemNumberElement.focus()
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
