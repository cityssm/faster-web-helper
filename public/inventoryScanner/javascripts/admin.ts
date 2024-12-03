// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-type-assertion */

import type { cityssmGlobal } from '@cityssm/bulma-webapp-js/src/types.js'

declare const exports: {
  itemRequestsCount: number
}

declare const cityssm: cityssmGlobal
;(() => {
  const moduleUrlPrefix = `${document.querySelector('main')?.dataset.urlPrefix ?? ''}/modules/inventoryScanner`

  const itemRequestsElement = document.querySelector('#itemRequests--column')

  let itemRequestsCount = exports.itemRequestsCount

  function renderItemRequests(): void {
    ;(itemRequestsElement?.querySelector('span') as HTMLElement).textContent =
      itemRequestsCount.toString()

    if (itemRequestsCount === 0) {
      itemRequestsElement?.classList.add('is-hidden')
    } else {
      itemRequestsElement?.classList.remove('is-hidden')
    }
  }

  function refreshItemRequests(): void {
    cityssm.postJSON(
      `${moduleUrlPrefix}/doGetItemRequestsCount`,
      {},
      (rawResponseJSON) => {
        const responseJSON = rawResponseJSON as unknown as {
          itemRequestsCount: number
        }

        itemRequestsCount = responseJSON.itemRequestsCount

        renderItemRequests()
      }
    )
  }

  renderItemRequests()

  globalThis.setInterval(refreshItemRequests, 5 * 60_000)
})()
