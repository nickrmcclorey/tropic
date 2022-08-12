
function getToasterElement(): HTMLElement {
    return document.getElementById('toast')
}

function showToast(message: string, ...classList: string[]): void {
    let toaster: HTMLElement = getToasterElement();
    toaster.textContent = message
    toaster.classList.add('show', ...classList);
    setTimeout(resetToaster, 3000);
}

function createSuccessToast(message: string): void {
    showToast(message, 'success')
}

function createErrorToast(message: string): void {
    showToast(message, 'error')
}

function resetToaster(): void {
    let toaster: HTMLElement = getToasterElement();
    toaster.textContent = '';
    toaster.className = '';
}

export {
    createErrorToast,
    createSuccessToast
}