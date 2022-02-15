import {INotify} from './types';
declare function structuredClone<T>(val: T): T;

async function doAction(self: Element, recipientElement: Element, {
    valFromEvent, vfe, valFromTarget, vft, clone, parseValAs, trueVal, falseVal, as, prop, fn, toggleProp, plusEq, withArgs, propName
}: INotify, event?: Event){
    const valFE = vfe || valFromEvent;
    const valFT = vft || valFromTarget;
    if(event === undefined && valFE !== undefined) return;
    const valPath = (event !== undefined && valFE ? valFE : valFT) || (propName || 'value');
    const {splitExt} = await import('./splitExt.js');
    const split = splitExt(valPath as string);
    let src: any = valFE !== undefined ? ( event ? event : self) : self; 
    const {getProp} = await import('./getProp.js');
    let val = getProp(src, split);
    if(val === undefined) return;
    if(clone) val = structuredClone(val);
    if(parseValAs !== undefined){
        val = convert(val, parseValAs);
    }
    if(trueVal && val){
        val = trueVal;
    }else if(falseVal && !val){
        val = falseVal;
    }
    if(as !== undefined){
        //const propKeyLispCase = camelToLisp(propKey);
        switch(as){
            case 'str-attr':
                recipientElement.setAttribute(prop!, val.toString());
                break;
            case 'obj-attr':
                recipientElement.setAttribute(prop!, JSON.stringify(val));
                break;
            case 'bool-attr':
                if(val) {
                    recipientElement.setAttribute(prop!, '');
                }else{
                    recipientElement.removeAttribute(prop!);
                }
                break;
            // default:
            //     if(toProp === '...'){
            //         Object.assign(subMatch, val);
            //     }else{
            //         (<any>subMatch)[toProp] = val;
            //     }
                
    
        }
    }else{
        if(prop !== undefined){
            doSet(recipientElement, prop, val, plusEq, toggleProp)
        }else if(fn !== undefined){
            doInvoke(recipientElement, fn, val, withArgs, event);
        }else{
            throw 'NI'; //Not Implemented
        }
        
    }
}