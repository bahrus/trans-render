export function createTemplate(html, context, symbol) {
    const useCache = (context !== undefined) && (symbol !== undefined);
    const cache = context !== undefined ? (context.cache ? context.cache : context) : undefined;
    if (useCache) {
        if (cache[symbol] !== undefined)
            return cache[symbol];
    }
    const template = document.createElement("template");
    template.innerHTML = html;
    if (useCache) {
        cache[symbol] = template;
    }
    return template;
}
