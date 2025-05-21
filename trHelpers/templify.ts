export interface TemplifyOptions {
    attrsToRemoveFromFirstChild?: string[],
    attrsToRemoveFromSrc?: string[],

}
export function templify(src: Element, options: TemplifyOptions = {}){
    //TODO:  look for itemref attribute?
    const {attrsToRemoveFromFirstChild, attrsToRemoveFromSrc} = options;
    if(attrsToRemoveFromSrc !== undefined){
        for(const attr of attrsToRemoveFromSrc){
            src.removeAttribute(attr);
        }
    }
    const templ = document.createElement('template');
    templ.innerHTML = src.outerHTML;
    if(attrsToRemoveFromFirstChild !== undefined){
        const firstChild = templ.content.firstElementChild;
        if(firstChild !== null){
            for(const attr of attrsToRemoveFromFirstChild){
                firstChild.removeAttribute(attr);
            }
        }
    }
    src.innerHTML = '';
    if('hidden' in src){
        src.hidden = true;
    }
    return templ;
}