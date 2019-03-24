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
                case "string":
                    target.setAttribute(key, attrib);
                    break;
                case "boolean":
                    if (attrib === true) {
                        target.setAttribute(key, "");
                    }
                    else {
                        target.removeAttribute(key);
                    }
            }
            if (attrib === true) {
                target.setAttribute(key, "");
            }
        }
        //delete source[attrib];
    }
}
export function domAssign(target, vals) {
    if (vals.propVals !== undefined) {
        const valCopy = { ...vals };
        assignSpecial(target, valCopy.propVals, ["dataset", "style"]);
        setAttribs(target, valCopy);
        Object.assign(target, valCopy);
    }
    if (vals.attribs !== undefined) {
        setAttribs(target, vals);
    }
}
