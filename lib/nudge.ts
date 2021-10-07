/**
 * Decrement "disabled" counter, remove when reaches 0
 * @param prevSib 
 */
 export function nudge(prevSib: Element) { //TODO:  Share with be-observant
    const da = prevSib.getAttribute('disabled');
    if (da !== null) {
        if (da.length === 0 || da === "1") {
            prevSib.removeAttribute('disabled');
            (<any>prevSib).disabled = false;
        }
        else {
            prevSib.setAttribute('disabled', (parseInt(da) - 1).toString());
        }
    }
}