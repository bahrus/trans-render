export function linkTemplates(elementInHost: Element, host: any, ids: string[]){
    const rn = elementInHost.getRootNode() as DocumentFragment;
    if(rn.nodeType === 9){
        for(const id of ids){
            host[id] = convertToTemplate((<any>self)[id] as Element);
        }
    }else{
        for(const id of ids){
            const el = rn.querySelector(`#${id}`);
            if(el !== null){
                host[id] = convertToTemplate(el);
            }else{
                console.error(`Element with id ${id} not found in host`);
            }
        }
    }
}

function convertToTemplate(el: Element): HTMLTemplateElement{
    if(el.localName === 'template') return el as HTMLTemplateElement;
    const templ = document.createElement('template');
    templ.innerHTML = el.outerHTML;
    return templ;
}