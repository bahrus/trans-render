import {RenderContext, PlugInArgs, Plugin} from '../types.d.js';

function fromTuple(ctx: RenderContext, pia: PlugInArgs){
    const target = ctx.target;
    if(target === undefined || target === null) return;
    target.innerHTML = pia[1];
}
export const unsafeHTMLSym: unique symbol = Symbol.for('ol5uc/x6b06k3qghWKq6nA==');
export const plugin: Plugin = {
    fn: fromTuple,
    sym: unsafeHTMLSym
};