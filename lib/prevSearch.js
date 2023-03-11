export function prevSearch(el, css) {
    let upEl = el.previousElementSibling;
    while (upEl && !upEl.matches(css)) {
        upEl = upEl.previousElementSibling;
    }
    return upEl;
}
