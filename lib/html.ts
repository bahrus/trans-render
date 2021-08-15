export function html(strings: TemplateStringsArray, ...keys: string[]) {
    const templateEl = document.createElement('template');
    templateEl.innerHTML = strings.join('');
    return templateEl;
}