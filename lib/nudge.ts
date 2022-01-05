/**
 * Decrement "disabled" counter, remove when reaches 0
 * @param el 
 */
 export function nudge(el: Element, attr = 'disabled') { //TODO:  Share with be-observant
    const da = el.getAttribute(attr);
    if (da !== null) {
        if (da.length === 0 || da === "1") {
            el.removeAttribute(attr);
            if(attr === 'disabled') (<any>el).disabled = false;
        }
        else {
            el.setAttribute(attr, (parseInt(da) - 1).toString());
        }
    }
}