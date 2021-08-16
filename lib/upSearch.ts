export function upSearch(el: Element, css: string){
    if(css === 'parentElement') return el.parentElement;
    let upEl = el.previousElementSibling || el.parentElement;
    while(upEl && !upEl.matches(css)){
        upEl = upEl.previousElementSibling || upEl.parentElement;
    }
    return upEl;
}