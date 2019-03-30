function assignSpecial(target, vals, propNames) {
    propNames.forEach(propName => {
        const targetProp = target[propName];
        const srcProp = vals[propName];
        Object.assign(targetProp, srcProp);
        delete vals[propName];
    });
}
function setAttribs(target, source) {
    const attributes = source.attribs;
    if (attributes !== undefined) {
        for (const key in attributes) {
            const attrib = attributes[key];
            switch (typeof attrib) {
                case 'string':
                    target.setAttribute(key, attrib); // why is casting needed?
                    break;
                case "boolean":
                    if (attrib === true) {
                        target.setAttribute(key, "");
                    }
                    else {
                        target.removeAttribute(key);
                    }
                    break;
                case "number":
                    target.setAttribute(key, attrib.toString());
                    break;
                case null:
                case undefined:
                    target.removeAttribute(key);
                    break;
            }
        }
    }
}
export function domAssign(target, vals) {
    const propVals = vals.propVals;
    if (propVals !== undefined) {
        const valCopy = { ...propVals };
        assignSpecial(target, valCopy, ["dataset", "style"]);
        Object.assign(target, valCopy);
        setAttribs(target, valCopy);
    }
    if (vals.attribs !== undefined) {
        setAttribs(target, vals);
    }
}
