;(() => {
  /*
   * Scanner Key
   */

  let scannerKey = globalThis.localStorage.getItem('scannerKey')

  if (scannerKey === null) {
    // eslint-disable-next-line sonarjs/pseudo-random, @typescript-eslint/no-magic-numbers
    scannerKey = Math.random().toString(36).slice(2, 10).toUpperCase()
    globalThis.localStorage.setItem('scannerKey', scannerKey)
  }

  ;(document.querySelector('#scanner--scannerKey') as HTMLInputElement).value =
    scannerKey
  ;(document.querySelector('#about--scannerKey') as HTMLElement).textContent =
    scannerKey

    
})()
