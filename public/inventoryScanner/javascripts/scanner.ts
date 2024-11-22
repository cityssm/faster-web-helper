import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

declare const cityssm: cityssmGlobal
(() => {
  const urlPrefix = document.querySelector('main')?.dataset.urlPrefix ?? ''

  function clearFieldAndFocus(event: Event): void {
    event.preventDefault()

    const inputElement = (event.currentTarget as HTMLElement).closest('.field')?.querySelector('input') as HTMLInputElement

    inputElement.value = ''
    inputElement.focus()
  }

  const clearButtonElements = document.querySelectorAll('button.is-clear-button')

  for (const clearButtonElement of clearButtonElements) {
    clearButtonElement.addEventListener('click', clearFieldAndFocus)
  }

  document.querySelector('#form--scanner')?.addEventListener('submit', (formEvent) => {
    formEvent.preventDefault()

    cityssm.postJSON(`${urlPrefix}/apps/inventoryScanner/doRecordScan`,
      formEvent.currentTarget,
      (responseJSON) => {
        
      }
    )
  })
})()