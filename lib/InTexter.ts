import {PMDo, RenderContext} from './types.js';

//type NestedString = (string | string[])[];
type Fn = (ctx: RenderContext) => string;

const weakMap = new WeakMap<Element, Fn>();

export class InTexter implements PMDo{
    do(ctx: RenderContext){
        let text = ctx.rhs as string;
        const target = ctx.target!;
        const host = ctx.host;
        if(host !== undefined && text.includes('${') && text.includes('}') && !text.includes('(')){

            let fn = weakMap.get(target);
            if(fn === undefined){
                fn = eval('({ctx, host, target, idx, mode, targetProp, options, val, rhs  }) => `' + text + '`') as Fn;
                weakMap.set(target, fn);
            }
            text = fn(ctx);
        }
        
        target.textContent = text;
    }
}