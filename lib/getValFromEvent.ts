import { splitExt } from './splitExt.js';
import { getProp } from './getProp.js';
import { IValFromEventInstructions } from './types';
export async function getValFromEvent(self: Element, {vfe, valFromEvent, vft, valFromTarget, propName, clone, parseValAs, trueVal, falseVal}: IValFromEventInstructions, event?: Event){
    const valFE = vfe || valFromEvent;
    const valFT = vft || valFromTarget;
    if(event === undefined && valFE !== undefined) return;
    const valPath = (event !== undefined && valFE ? valFE : valFT) || (propName || 'value');
    const split = splitExt(valPath as string);
    let src: any = valFE !== undefined ? ( event ? event : self) : self; 
    let dynamicVal = getProp(src, split);
    if(dynamicVal === undefined) return;
    if(clone) dynamicVal = structuredClone(dynamicVal);
    if(parseValAs !== undefined){
        const {convert} = await import('./convert.js');
        dynamicVal = convert(dynamicVal, parseValAs);
    }
    if(trueVal && dynamicVal){
        dynamicVal = trueVal;
    }else if(falseVal && !dynamicVal){
        dynamicVal = falseVal;
    }
    return dynamicVal;
}