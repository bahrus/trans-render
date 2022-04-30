import {PEA} from './PEA.js';
import {RenderContext} from './types.d.js';
import {DTR} from './DTR.js';
export class PEAT extends PEA{
    override async do(ctx: RenderContext){
        await super.do(ctx);
        const {target} = ctx;
        target!.innerHTML = '';
        const templ = ctx.rhs[3] as HTMLTemplateElement;
        DTR.transform(templ, ctx, target!);
    }
}