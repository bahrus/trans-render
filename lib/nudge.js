/**
 * Decrement "disabled" counter, remove when reaches 0
 * @param el
 */
export function nudge(el, attr = 'disabled') {
    const da = el.getAttribute(attr);
    if (da !== null) {
        if (da.length === 0 || da === "1") {
            el.removeAttribute(attr);
            if (attr === 'disabled')
                el.disabled = false;
        }
        else {
            el.setAttribute(attr, (parseInt(da) - 1).toString());
        }
    }
}
