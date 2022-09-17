export function upSearch(el, css, doRootSearch = false) {
    if (css === 'parentElement')
        return el.parentElement;
    let upEl = el.previousElementSibling || el.parentElement;
    while (upEl && !upEl.matches(css)) {
        upEl = upEl.previousElementSibling || upEl.parentElement;
    }
    if (doRootSearch && upEl === null) {
        upEl = el.getRootNode().querySelector(css);
    }
    return upEl;
}
