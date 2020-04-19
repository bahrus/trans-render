import {TransRenderSymbols as TRS} from './trans-render-symbols.js';
import {setSymbol} from './manageSymbols.js';
export const sk = setSymbol(TRS.is, 'sk');

export function interpolate(target: any, prop: string, obj: any, isAttr: boolean = false){
    //const privateStorageKey = '__' + prop + '__split';
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
            //const chained = s.substr(1).split('??');
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

