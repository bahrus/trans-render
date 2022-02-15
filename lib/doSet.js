//copied from pass-up initially
export function doSet(recipientElement, prop, val, plusEq, toggleProp) {
    if (plusEq) {
        recipientElement[prop] += val;
    }
    else if (toggleProp) {
        recipientElement[prop] = !recipientElement[prop];
    }
    else {
        recipientElement[prop] = val;
    }
}
