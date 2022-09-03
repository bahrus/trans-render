import {PEA} from './PEA.js';
import {RenderContext} from './types.d.js';
import {DTR} from './DTR.js';
const prevT = new WeakMap<Element, HTMLTemplateElement>();
export class PEAT extends PEA{
    override async do(ctx: RenderContext){
        await super.do(ctx);
        const {target} = ctx;
        const templ = ctx.rhs[3] as HTMLTemplateElement;
        if(prevT.has(target!)){
            if(prevT.get(target!) === templ) return
        }
        target!.innerHTML = '';
        DTR.transform(templ, ctx, target!);
    }
}