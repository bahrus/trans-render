export function createTemplate(html: string, context?: any, symbol?: symbol){
    const useCache = (context !== undefined) && (symbol !== undefined);
    const cache = context !== undefined ? (context.cache ? context.cache : context) : undefined;
    if(useCache){
        if(cache[symbol!] !== undefined) return cache[symbol!];
    }
    const template = document.createElement("template") as HTMLTemplateElement;
    template.innerHTML = html;
    if(useCache) {
        cache[symbol!] = template;
    }
    return template;
}