export function html(strings, ...keys) {
    const templateEl = document.createElement('template');
    templateEl.innerHTML = strings.join('');
    return templateEl;
}
