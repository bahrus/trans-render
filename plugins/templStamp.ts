import {RenderContext, PlugInArgs, Plugin} from '../types.d.js';
function stamp(fragment: HTMLElement | DocumentFragment | SVGElement, attr: string, refs:{[key: string]: symbol}, ctx: RenderContext){
    const target = ctx.host || ctx.cache;
    Array.from(fragment.querySelectorAll(`[${attr}]`)).forEach(el =>{
        const val = el.getAttribute(attr)!;
        const sym = refs[val];
        if(sym !== undefined){
            target[sym] = el;
        }
    })
}
function fromTuple(ctx: RenderContext, pia: PlugInArgs){
    stamp(ctx.target!, 'id', pia[1] as {[key: string]: symbol}, ctx);
    stamp(ctx.target!, 'part', pia[1] as {[key: string]: symbol}, ctx);
}
export const templStampSym: unique symbol = Symbol.for('Dd5nJwRNaEiFtfam5oaSkg');

export const plugin: Plugin = {
    fn: fromTuple,
    sym: templStampSym
};