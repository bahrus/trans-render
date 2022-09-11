export async function doAction(self, recipientElement, notify, event) {
    const { as, prop, fn, toggleProp, plusEq, withArgs } = notify;
    let { val } = notify;
    if (val === undefined) {
        const { getValFromEvent } = await import('./getValFromEvent.js');
        val = await getValFromEvent(self, notify, event);
    }
    if (as !== undefined) {
        switch (as) {
            case 'str-attr':
                recipientElement.setAttribute(prop, val.toString());
                break;
            case 'obj-attr':
                recipientElement.setAttribute(prop, JSON.stringify(val));
                break;
            case 'bool-attr':
                if (val) {
                    recipientElement.setAttribute(prop, '');
                }
                else {
                    recipientElement.removeAttribute(prop);
                }
                break;
        }
    }
    else {
        if (prop !== undefined) {
            const { doSet } = await import('./doSet.js');
            doSet(recipientElement, prop, val, plusEq, toggleProp);
        }
        else if (fn !== undefined) {
            const { doInvoke } = await import('./doInvoke.js');
            doInvoke(recipientElement, fn, val, withArgs, event);
        }
        else {
            throw 'NI'; //Not Implemented
        }
    }
}
