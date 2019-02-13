export function promoteChildren(el: HTMLElement){
    el.style.display = 'none';
    while (el.lastElementChild) {
        el.insertAdjacentElement('afterend', el.lastElementChild);
    }
    //el.remove();
}
