import { arr } from './arr.js';
/**
 * Decrement "disabled" counter, remove when reaches 0
 * @param el
 */
export function nudge(el, attr = 'disabled') {
    const attrs = arr(attr);
    for (const attr of attrs) {
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
}
