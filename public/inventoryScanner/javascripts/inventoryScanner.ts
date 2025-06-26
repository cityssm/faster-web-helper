import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

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

  const scannerMessageTextElement = successMessageElement.querySelector(
    'strong'
  ) as HTMLElement

  function hideSuccessMessage(): void {
    successMessageElement.classList.add('is-hidden')
  }

  /*
   * Item Number
   */

  const itemNumberElement = formElement.querySelector(
    '#scanner--itemNumber'
  ) as HTMLInputElement

  const countedQuantityElement = formElement.querySelector(
    '#scanner--countedQuantity'
  ) as HTMLInputElement

  function jumpToQuantityInput(inputEvent: KeyboardEvent): void {
    if (inputEvent.key === 'Enter') {
      inputEvent.preventDefault()
      inputEvent.stopPropagation()

      if (itemNumberElement.validity.valid) {
        countedQuantityElement.focus()
        countedQuantityElement.select()
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
   * Clear buttons
   */

  function clearFieldAndFocus(event: Event): void {
    event.preventDefault()

    const inputElement = (event.currentTarget as HTMLElement)
      .closest('.field')
      ?.querySelector('input') as HTMLInputElement

    inputElement.value = ''

    inputElement.focus()
  }

  const clearButtonElements = formElement.querySelectorAll(
    'button.is-clear-button'
  )

  for (const clearButtonElement of clearButtonElements) {
    clearButtonElement.addEventListener('click', clearFieldAndFocus)
  }

  /*
   * Form Submit
   */

  formElement.addEventListener('submit', (formEvent) => {
    formEvent.preventDefault()

    if (!formElement.checkValidity()) {
      return
    }

    cityssm.postJSON(
      `${scannerUrlPrefix}/doRecordCountedQuantity`,
      formElement,
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as unknown as {
          success: boolean

          batchIsOpen: boolean
          message: string
        }

        if (responseJSON.success) {
          scannerMessageTextElement.textContent = responseJSON.message
          successMessageElement.classList.remove('is-hidden')
          globalThis.setTimeout(hideSuccessMessage, 1000)

          itemNumberElement.value = ''
          refreshItemDescription()
          
          countedQuantityElement.value = ''

          itemNumberElement.focus()
        } else {
          bulmaJS.alert({
            contextualColorName: 'danger',
            title: 'Error Recording Inventory Scan',

            message: responseJSON.message,

            okButton: {
              callbackFunction: () => {
                if (!responseJSON.batchIsOpen) {
                  globalThis.location.reload()
                }
              }
            }
          })
        }
      }
    )
  })
})()
