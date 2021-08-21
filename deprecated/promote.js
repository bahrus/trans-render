export function promoteChildren(el) {
    el.style.display = 'none';
    while (el.lastElementChild) {
        el.insertAdjacentElement('afterend', el.lastElementChild);
    }
    //el.remove();
}
