export function createTemplate(html: string){
    const template = document.createElement("template") as HTMLTemplateElement;
    template.innerHTML = html;
    return template;
}

export function cacheTemplate(html : string, cache: any, symbol?: symbol){
    const template = createTemplate(html);
    const sym = symbol === undefined ? Symbol() : symbol;
    cache[sym] = template;
    return sym;
}