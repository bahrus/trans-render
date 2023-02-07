//copied from pass-up initially
export function doSet(recipientElement, prop, val, plusEq, toggleProp) {
    if (plusEq !== undefined) {
        const propVal = recipientElement[prop] || 0;
        if (plusEq === true) {
            recipientElement[prop] = propVal + val;
        }
        else {
            recipientElement[prop] = propVal + plusEq;
        }
    }
    else if (toggleProp) {
        recipientElement[prop] = !recipientElement[prop];
    }
    else {
        recipientElement[prop] = val;
    }
}
