(() => {

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
})()