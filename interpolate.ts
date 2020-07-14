import {RenderContext, TransformValueArrayOptions, PlugInArgs, Plugin} from './types2.d.js';
import {getProp} from './transform.js';
const sk =  Symbol('sk');

export function interpolate(target: any, prop: string, obj: any, isAttr: boolean = false){
    let split = target[sk] as (string | string[])[] | undefined;
    if(split === undefined){
        const txt = isAttr ?  target.getAttribute(prop) : target[prop] as string;
        split = txt.split('|') as string[];
        target[sk] = split.map(s =>{
            const optionalChain = (s as string).split('??'); //todo trimend only -- waiting for universal browser support
            return optionalChain.length === 1 ? optionalChain[0] : optionalChain;
        }) as (string | string[])[];
    }
    const newVal = target[sk].map((a: string | string[], idx: number) => {
        const isArray = Array.isArray(a);
        const s = isArray ? a[0] : a as string;
        if(s[0] === '.'){
            const frstItem = obj[s.substr(1).trim()]; 
            if(!isArray) {
                return frstItem;
            }else{
                return (frstItem === undefined || frstItem === null) ? a[1] : frstItem; 
            }
        } else{
            if(idx %2 === 1){
                return '|' + s + '|';
            }else{
                return s;
            }
            
        }
    }).join('');
    if(isAttr) {
        target.setAttribute(prop, newVal);
    }else{
        target[prop] = newVal;
    }
}

export const interpolateSym: unique symbol = Symbol.for('cac2869c-94ef-4d3e-8264-418103c7433c');

function fromTuple(ctx: RenderContext, pia: PlugInArgs){
    let val = pia[2];
    if(Array.isArray(val)){
        val = getProp(ctx, val);
    }else{
        switch(typeof pia[2]){
            case 'function':
                val = val(ctx, pia);
                break;
        }
    }
    interpolate(ctx.target, pia[1] as string, val, pia[3]);
}

export const plugin: Plugin = {
    fn: fromTuple,
    sym: interpolateSym
}

