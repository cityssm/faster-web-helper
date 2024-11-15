(() => {
    function clearFieldAndFocus(event) {
        event.preventDefault();
        const inputElement = event.currentTarget.closest('.field')?.querySelector('input');
        inputElement.value = '';
        inputElement.focus();
    }
    const clearButtonElements = document.querySelectorAll('button.is-clear-button');
    for (const clearButtonElement of clearButtonElements) {
        clearButtonElement.addEventListener('click', clearFieldAndFocus);
    }
})();
