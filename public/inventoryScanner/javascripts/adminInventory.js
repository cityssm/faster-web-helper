"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const moduleUrlPrefix = `${document.querySelector('main')?.dataset.urlPrefix ?? ''}/modules/inventoryScanner`;
    let inventory = exports.inventory;
    const inventoryFilterElement = document.querySelector('#filter--inventory');
    const inventoryDisplayCountElement = document.querySelector('#displayCount--inventory');
    const inventoryContainerElement = document.querySelector('#container--inventory');
    function renderInventory(event) {
        if (event !== undefined) {
            event.preventDefault();
        }
        inventoryContainerElement.replaceChildren();
        const tableElement = document.createElement('table');
        tableElement.className = 'table is-fullwidth is-hoverable';
        tableElement.innerHTML = `<thead><tr>
      <th>Storeroom</th>
      <th>Item Number</th>
      <th>Description</th>
      <th class="has-text-right">Unit Price</th>
      <th class="has-text-right">Quantity on Hand</th>
      </tr></thead>
      <tbody></tbody>`;
        let displayCount = 0;
        const filterPieces = inventoryFilterElement.value
            .trim()
            .toLowerCase()
            .split(' ');
        for (const item of inventory) {
            let displayItem = true;
            for (const filterPiece of filterPieces) {
                if (!item.itemNumber.toLowerCase().includes(filterPiece) &&
                    !item.itemDescription.toLowerCase().includes(filterPiece)) {
                    displayItem = false;
                    break;
                }
            }
            if (!displayItem) {
                continue;
            }
            displayCount += 1;
            const tableRowElement = document.createElement('tr');
            tableRowElement.innerHTML = `<td data-field="itemStoreroom"></td>
        <td data-field="itemNumber"></td>
        <td data-field="itemDescription"></td>
        <td class="has-text-right" data-field="unitPrice"></td>
        <td class="has-text-right" data-field="availableQuantity"></td>`;
            tableRowElement.querySelector('[data-field="itemStoreroom"]').textContent = item.itemStoreroom;
            tableRowElement.querySelector('[data-field="itemNumber"]').textContent = item.itemNumber;
            tableRowElement.querySelector('[data-field="itemDescription"]').textContent = item.itemDescription;
            tableRowElement.querySelector('[data-field="unitPrice"]').textContent = `$${item.unitPrice.toFixed(2)}`;
            const availableQuantityElement = tableRowElement.querySelector('[data-field="availableQuantity"]');
            availableQuantityElement.textContent = item.availableQuantity.toString();
            if (item.availableQuantity === 0) {
                availableQuantityElement.classList.add('is-warning');
            }
            else if (item.availableQuantity < 0) {
                availableQuantityElement.classList.add('is-danger');
            }
            tableElement.querySelector('tbody')?.append(tableRowElement);
        }
        inventoryDisplayCountElement.textContent = `${displayCount} / ${inventory.length}`;
        if (displayCount === 0) {
            inventoryContainerElement.innerHTML = `<div class="message is-info">
        <p class="message-body">There are no items that meet the search criteria.</p>
        </div>`;
        }
        else {
            inventoryContainerElement.replaceChildren(tableElement);
        }
    }
    function reloadInventory(event) {
        inventoryContainerElement.replaceChildren();
        inventoryContainerElement.innerHTML = `<div class="message is-info">
      <p class="message-body">Reloading items...</p>
      </div>`;
        cityssm.postJSON(`${moduleUrlPrefix}/doGetInventory`, {}, (rawResponseJson) => {
            const responseJson = rawResponseJson;
            inventory = responseJson.inventory;
            renderInventory();
        });
    }
    renderInventory();
    inventoryFilterElement.addEventListener('keyup', renderInventory);
    document
        .querySelector('#reload--inventory')
        ?.addEventListener('click', reloadInventory);
})();
