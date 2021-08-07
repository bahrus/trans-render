import {PMDo, RenderContext} from './types.js';

type Fn = (ctx: RenderContext) => string;

//const weakMap = new WeakMap<Element, Fn>();
const compiledFns: {[key: string]: Fn} = {};

export class InTexter implements PMDo{
    do(ctx: RenderContext){
        let text = ctx.rhs as string;
        const target = ctx.target!;
        const host = ctx.host;
        if(host !== undefined && text.includes('${') && text.includes('}') && !text.includes('(')){

            let fn = compiledFns[text];
            if(fn === undefined){
                fn = eval('({ctx, host, target, idx, mode, targetProp, options, val, rhs  }) => `' + text + '`') as Fn;
                compiledFns[text] = fn;
            }
            text = fn(ctx);
        }
        
        target.textContent = text;
    }
}