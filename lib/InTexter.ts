import {PMDo, RenderContext} from './types.js';

type nestedString = (string | string[])[];

const weakMap = new WeakMap<Element, nestedString>();

export class InTexter implements PMDo{
    do(ctx: RenderContext){
        let text = ctx.rhs as string;
        const target = ctx.target!;
        if(ctx.host !== undefined && text.includes('|')){

            if(!weakMap.has(target)){
                const split = text.split('|');
                weakMap.set(target,  split.map(s => {
                    if(s[0] !== '.') return s;
                    const optionalChain = s.split('??'); //todo trimend only -- waiting for universal browser support
                    return optionalChain.length === 1 ? optionalChain[0] : optionalChain;
                }) as (string | string[])[]);
            }
        }
        target.textContent = text;
    }
}