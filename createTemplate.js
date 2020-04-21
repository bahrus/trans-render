export function createTemplate(html, cache, symbol) {
    const useCache = (cache !== undefined) && (symbol !== undefined);
    if (useCache) {
        if (cache[symbol] !== undefined)
            return cache[symbol];
    }
    const template = document.createElement("template");
    template.innerHTML = html;
    if (useCache)
        cache[symbol] = template;
    return template;
}
