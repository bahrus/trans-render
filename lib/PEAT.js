import { PEA } from './PEA.js';
import { DTR } from './DTR.js';
export class PEAT extends PEA {
    async do(ctx) {
        await super.do(ctx);
        const { target } = ctx;
        target.innerHTML = '';
        const templ = ctx.rhs[3];
        DTR.transform(templ, ctx, target);
    }
}
