import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

import type { ItemValidationRecord } from '../../../modules/inventoryScanner/types.js'

declare const exports: {
  inventory: ItemValidationRecord[]
}

declare const cityssm: cityssmGlobal
;(() => {
  const urlPrefix = document.querySelector('main')?.dataset.urlPrefix ?? ''

  let inventory = exports.inventory

  const inventoryFilterElement = document.querySelector(
    '#filter--inventory'
  ) as HTMLInputElement

  const inventoryDisplayCountElement = document.querySelector(
    '#displayCount--inventory'
  ) as HTMLElement

  const inventoryContainerElement = document.querySelector(
    '#container--inventory'
  ) as HTMLElement

  function renderInventory(event?: Event): void {
    if (event !== undefined) {
      event.preventDefault()
    }

    inventoryContainerElement.replaceChildren()

    const tableElement = document.createElement('table')
    tableElement.className = 'table is-fullwidth is-hoverable'

    tableElement.innerHTML = `<thead><tr>
      <th>Storeroom</th>
      <th>Item Number</th>
      <th>Description</th>
      <th class="has-text-right">Unit Price</th>
      <th class="has-text-right">Quantity on Hand</th>
      </tr></thead>
      <tbody></tbody>`

    let displayCount = 0
    const filterPieces = inventoryFilterElement.value
      .trim()
      .toLowerCase()
      .split(' ')

    for (const item of inventory) {
      let displayItem = true

      for (const filterPiece of filterPieces) {
        if (
          !item.itemNumber.toLowerCase().includes(filterPiece) &&
          !item.itemDescription.toLowerCase().includes(filterPiece)
        ) {
          displayItem = false
          break
        }
      }

      if (!displayItem) {
        continue
      }

      displayCount += 1

      const tableRowElement = document.createElement('tr')

      tableRowElement.innerHTML = `<td data-field="itemStoreroom"></td>
        <td data-field="itemNumber"></td>
        <td data-field="itemDescription"></td>
        <td class="has-text-right" data-field="unitPrice"></td>
        <td class="has-text-right" data-field="availableQuantity"></td>`
      ;(
        tableRowElement.querySelector(
          '[data-field="itemStoreroom"]'
        ) as HTMLTableCellElement
      ).textContent = item.itemStoreroom
      ;(
        tableRowElement.querySelector(
          '[data-field="itemNumber"]'
        ) as HTMLTableCellElement
      ).textContent = item.itemNumber
      ;(
        tableRowElement.querySelector(
          '[data-field="itemDescription"]'
        ) as HTMLTableCellElement
      ).textContent = item.itemDescription
      ;(
        tableRowElement.querySelector(
          '[data-field="unitPrice"]'
        ) as HTMLTableCellElement
      ).textContent = '$' + item.unitPrice.toFixed(2)
      ;(
        tableRowElement.querySelector(
          '[data-field="availableQuantity"]'
        ) as HTMLTableCellElement
      ).textContent = item.availableQuantity.toString()

      tableElement.querySelector('tbody')?.append(tableRowElement)
    }

    inventoryDisplayCountElement.textContent = `${displayCount} / ${inventory.length}`

    if (displayCount === 0) {
      inventoryContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no items that meet the search criteria.</p>
        </div>`
    } else {
      inventoryContainerElement.replaceChildren(tableElement)
    }
  }

  function reloadInventory(event: Event): void {
    inventoryContainerElement.replaceChildren()

    inventoryContainerElement.innerHTML = `<div class="message is-info">
      <p class="message-body">Reloading items...</p>
      </div>`

    cityssm.postJSON(`${urlPrefix}/modules/inventoryScanner/doGetInventory`, {}, (rawResponseJson) => {
      const responseJson = rawResponseJson as unknown as {inventory: ItemValidationRecord[]}
      inventory = responseJson.inventory
      renderInventory()
    })
  }

  renderInventory()
  inventoryFilterElement.addEventListener('keyup', renderInventory)

  document.querySelector('#reload--inventory')?.addEventListener('click', reloadInventory)
})()
