export function createTemplate(html) {
    const template = document.createElement("template");
    template.innerHTML = html;
    return template;
}
export function cacheTemplate(html, cache, symbol) {
    const template = createTemplate(html);
    const sym = symbol === undefined ? Symbol() : symbol;
    cache[sym] = template;
    return sym;
}
