import { mergeDeep } from '../mergeDeep.js';
function setAttribs(target, source) {
    const attributes = source.attribs;
    if (attributes !== undefined) {
        for (const key in attributes) {
            const attrib = attributes[key]; //why, typescript?
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
export function domMerge(target, vals) {
    const propVals = vals.propVals;
    if (propVals !== undefined) {
        //const valCopy = { ...propVals };
        //assignSpecial(target, valCopy, ["dataset", "style"]);
        //Object.assign(target, valCopy);
        //setAttribs(target, );
        mergeDeep(target, propVals);
    }
    if (vals.attribs !== undefined) {
        setAttribs(target, vals);
    }
}
