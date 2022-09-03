import { PEA } from './PEA.js';
import { DTR } from './DTR.js';
const prevT = new WeakMap();
export class PEAT extends PEA {
    async do(ctx) {
        await super.do(ctx);
        const { target } = ctx;
        const templ = ctx.rhs[3];
        if (prevT.has(target)) {
            if (prevT.get(target) === templ)
                return;
        }
        target.innerHTML = '';
        prevT.set(target, templ);
        DTR.transform(templ, ctx, target);
    }
}
