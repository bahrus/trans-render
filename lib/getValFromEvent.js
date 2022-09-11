import { splitExt } from './splitExt.js';
import { getProp } from './getProp.js';
export async function getValFromEvent(self, { vfe, valFromEvent, vft, valFromTarget, propName, clone, parseValAs, trueVal, falseVal }, event) {
    const valFE = vfe || valFromEvent;
    const valFT = vft || valFromTarget;
    if (event === undefined && valFE !== undefined)
        return;
    const valPath = (event !== undefined && valFE ? valFE : valFT) || (propName || 'value');
    const split = splitExt(valPath);
    let src = valFE !== undefined ? (event ? event : self) : self;
    let dynamicVal = getProp(src, split);
    if (dynamicVal === undefined)
        return;
    if (clone)
        dynamicVal = structuredClone(dynamicVal);
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
    return dynamicVal;
}
