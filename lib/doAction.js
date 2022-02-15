export async function doAction(self, recipientElement, { valFromEvent, vfe, valFromTarget, vft, clone, parseValAs, trueVal, falseVal, as, prop, fn, toggleProp, plusEq, withArgs, propName }, event) {
    const valFE = vfe || valFromEvent;
    const valFT = vft || valFromTarget;
    if (event === undefined && valFE !== undefined)
        return;
    const valPath = (event !== undefined && valFE ? valFE : valFT) || (propName || 'value');
    const { splitExt } = await import('./splitExt.js');
    const split = splitExt(valPath);
    let src = valFE !== undefined ? (event ? event : self) : self;
    const { getProp } = await import('./getProp.js');
    let val = getProp(src, split);
    if (val === undefined)
        return;
    if (clone)
        val = structuredClone(val);
    if (parseValAs !== undefined) {
        const { convert } = await import('./convert.js');
        val = convert(val, parseValAs);
    }
    if (trueVal && val) {
        val = trueVal;
    }
    else if (falseVal && !val) {
        val = falseVal;
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
            doSet(recipientElement, prop, val, plusEq, toggleProp);
        }
        else if (fn !== undefined) {
            doInvoke(recipientElement, fn, val, withArgs, event);
        }
        else {
            throw 'NI'; //Not Implemented
        }
    }
}
