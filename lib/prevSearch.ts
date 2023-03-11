export function prevSearch(el: Element, css: string){
    let upEl = el.previousElementSibling;
    while(upEl && !upEl.matches(css)){
        upEl = upEl.previousElementSibling;
    }
    return upEl;
}