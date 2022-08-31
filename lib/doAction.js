export async function doAction(self, recipientElement, { valFromEvent, val, vfe, valFromTarget, vft, clone, parseValAs, trueVal, falseVal, as, prop, fn, toggleProp, plusEq, withArgs, propName }, event) {
    if (val === undefined) {
        const valFE = vfe || valFromEvent;
        const valFT = vft || valFromTarget;
        if (event === undefined && valFE !== undefined)
            return;
        const valPath = (event !== undefined && valFE ? valFE : valFT) || (propName || 'value');
        const { splitExt } = await import('./splitExt.js');
        const split = splitExt(valPath);
        let src = valFE !== undefined ? (event ? event : self) : self;
        const { getProp } = await import('./getProp.js');
        let dynamicVal = getProp(src, split);
        if (dynamicVal === undefined)
            return;
        if (clone)
            val = structuredClone(dynamicVal);
        if (parseValAs !== undefined) {
            const { convert } = await import('./convert.js');
            dynamicVal = convert(dynamicVal, parseValAs);
        }
        if (trueVal && dynamicVal) {
            dynamicVal = trueVal;
        }
        else if (falseVal && !dynamicVal) {
            dynamicVal = falseVal;
        }
        val = dynamicVal;
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
