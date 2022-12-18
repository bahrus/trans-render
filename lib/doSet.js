//copied from pass-up initially
export function doSet(recipientElement, prop, val, plusEq, toggleProp) {
    if (plusEq !== undefined) {
        if (plusEq === true) {
            recipientElement[prop] += val;
        }
        else {
            recipientElement[prop] += plusEq;
        }
    }
    else if (toggleProp) {
        recipientElement[prop] = !recipientElement[prop];
    }
    else {
        recipientElement[prop] = val;
    }
}
