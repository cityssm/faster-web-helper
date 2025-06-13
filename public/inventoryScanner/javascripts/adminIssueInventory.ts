import type { BulmaJS } from '@cityssm/bulma-js/types.js'
import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'
import type { GPItemWithQuantity } from '@cityssm/dynamics-gp'
import type JsBarcodeType from 'jsbarcode'

import type { ItemValidationRecord } from '../../../modules/inventoryScanner/types.js'

declare const exports: {
  inventory: ItemValidationRecord[]

  openInventoryItemEventName: string
}

declare const bulmaJS: BulmaJS
declare const cityssm: cityssmGlobal
declare const JsBarcode: typeof JsBarcodeType
;(() => {
  const moduleUrlPrefix = `${document.querySelector('main')?.dataset.urlPrefix ?? ''}/modules/inventoryScanner`

  let inventory = exports.inventory

  const inventoryFilterElement = document.querySelector(
    '#filter--inventory'
  ) as HTMLInputElement

  const inventoryFilterZeroQuantityElement = document.querySelector(
    '#filter--showZeroQuantity'
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

      if (
        !inventoryFilterZeroQuantityElement.checked &&
        item.availableQuantity === 0
      ) {
        continue
      }

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

      const itemNumberElement = tableRowElement.querySelector(
        '[data-field="itemNumber"]'
      ) as HTMLTableCellElement

      itemNumberElement.innerHTML = `<a href="#" class="has-text-weight-bold has-text-link"
          data-item-storeroom="${cityssm.escapeHTML(item.itemStoreroom)}"
          data-item-number="${cityssm.escapeHTML(item.itemNumber)}">
          ${cityssm.escapeHTML(item.itemNumber)}
          </a>`

      itemNumberElement
        .querySelector('a')
        ?.addEventListener('click', openInventoryItem)
      ;(
        tableRowElement.querySelector(
          '[data-field="itemDescription"]'
        ) as HTMLTableCellElement
      ).textContent = item.itemDescription
      ;(
        tableRowElement.querySelector(
          '[data-field="unitPrice"]'
        ) as HTMLTableCellElement
      ).textContent = `$${item.unitPrice.toFixed(2)}`

      const availableQuantityElement = tableRowElement.querySelector(
        '[data-field="availableQuantity"]'
      ) as HTMLTableCellElement

      availableQuantityElement.textContent = item.availableQuantity.toString()

      if (item.availableQuantity === 0) {
        availableQuantityElement.classList.add('has-background-warning-light')
      } else if (item.availableQuantity < 0) {
        availableQuantityElement.classList.add('has-background-danger-light')
      }

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

  function reloadInventory(): void {
    inventoryContainerElement.replaceChildren()

    inventoryContainerElement.innerHTML = `<div class="message is-info">
      <p class="message-body">Reloading items...</p>
      </div>`

    cityssm.postJSON(
      `${moduleUrlPrefix}/doGetInventory`,
      {},
      (rawResponseJson) => {
        const responseJson = rawResponseJson as unknown as {
          inventory: ItemValidationRecord[]
        }
        inventory = responseJson.inventory
        renderInventory()
      }
    )
  }

  function openInventoryItem(event: Event): void {
    event.preventDefault()

    const linkElement = event.target as HTMLAnchorElement

    const itemStoreroom = linkElement.dataset.itemStoreroom ?? ''
    const itemNumber = linkElement.dataset.itemNumber ?? ''

    const item = inventory.find(
      (item) =>
        item.itemStoreroom === itemStoreroom && item.itemNumber === itemNumber
    )

    if (item === undefined) {
      bulmaJS.alert({
        contextualColorName: 'danger',
        title: 'Item Not Found',

        message: `The item storeroom "${cityssm.escapeHTML(
          itemStoreroom
        )}" and item number "${cityssm.escapeHTML(itemNumber)}" could not be found.`
      })
      return
    }

    cityssm.openHtmlModal('inventoryItemView', {
      onshow(modalElement) {
        ;(
          modalElement.querySelector('.modal-card-title') as HTMLElement
        ).textContent =
          `${cityssm.escapeHTML(itemNumber)} [${cityssm.escapeHTML(itemStoreroom)}]`
        ;(
          modalElement.querySelector(
            '#inventoryItemView--itemDescription'
          ) as HTMLElement
        ).textContent = item.itemDescription

        cityssm.postJSON(
          `${moduleUrlPrefix}/doGetInventoryItemDetails`,
          {
            itemStoreroom,
            itemNumber
          },
          (rawResponseJSON) => {
            const responseJSON = rawResponseJSON as
              | {
                  success: false

                  message: string
                }
              | {
                  success: true

                  data: GPItemWithQuantity
                  source: 'dynamicsGP'
                }

            const detailsElement = modalElement.querySelector(
              '#inventoryItemView--details'
            ) as HTMLElement

            if (responseJSON.success) {
              const data = responseJSON.data

              detailsElement.insertAdjacentHTML(
                'beforeend',
                `<hr />
                  <h2 class="title is-5">Details from Dynamics GP</h2>
                  <div class="columns">
                  <div class="column">
                    <div class="columns mb-0">
                      <div class="column has-text-weight-bold">Standard Cost:</div>
                      <div class="column is-narrow has-text-right">
                        $${cityssm.escapeHTML(data.standardCost.toFixed(2))}
                      </div>
                    </div>
                    <div class="columns">
                      <div class="column has-text-weight-bold">Current Cost:</div>
                      <div class="column is-narrow has-text-right">
                        $${cityssm.escapeHTML(data.currentCost.toFixed(2))}
                      </div>
                    </div>
                  </div>
                  <div class="column">
                  <div class="columns mb-0">
                    <div class="column has-text-weight-bold">Quantity on Hand:</div>
                    <div class="column is-narrow has-text-right">
                      ${cityssm.escapeHTML(data.quantityOnHand.toString())}
                    </div>
                  </div>
                  <div class="columns">
                    <div class="column has-text-weight-bold">Quantity of Order:</div>
                    <div class="column is-narrow has-text-right">
                      ${cityssm.escapeHTML(data.quantityOnOrder.toString())}
                    </div>
                  </div>
                </div>`
              )


            } else {
              detailsElement.innerHTML = `<div class="message is-warning">
                <p class="message-body">${cityssm.escapeHTML(responseJSON.message)}</p>
                </div>`
            }
          }
        )
      },
      onshown(modalElement) {
        bulmaJS.toggleHtmlClipped()

        JsBarcode(
          modalElement.querySelector('#inventoryItemView--barcode'),
          itemNumber,
          {
            format: 'CODE39',
            displayValue: true,
            width: 2,
            height: 80
          }
        )
      },

      onremoved() {
        bulmaJS.toggleHtmlClipped()
      }
    })
  }

  globalThis.addEventListener(
    exports.openInventoryItemEventName,
    openInventoryItem
  )

  renderInventory()
  inventoryFilterElement.addEventListener('keyup', renderInventory)
  inventoryFilterZeroQuantityElement.addEventListener('change', renderInventory)

  document
    .querySelector('#reload--inventory')
    ?.addEventListener('click', reloadInventory)
})()
