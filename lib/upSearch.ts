export function upSearch(el: Element, css: string, doRootSearch: boolean = false){
    if(css === 'parentElement') return el.parentElement;
    if(el.matches(css)) return el;
    let upEl = el.previousElementSibling || el.parentElement;
    while(upEl && !upEl.matches(css)){
        upEl = upEl.previousElementSibling || upEl.parentElement;
    }
    if(doRootSearch && upEl === null){
        upEl = (el.getRootNode() as DocumentFragment).querySelector(css);
    }
    return upEl;
}