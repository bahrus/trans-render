export function createTemplate(html: string, cache?: any, symbol?: symbol){
    const useCache = (cache !== undefined) && (symbol !== undefined);
    if(useCache){
        if(cache[symbol!] !== undefined) return cache[symbol!];
    }
    const template = document.createElement("template") as HTMLTemplateElement;
    template.innerHTML = html;
    if(useCache) cache[symbol!] = template;
    return template;
}