import { applyP } from './applyP.js';
export class P {
    do(ctx) {
        applyP(ctx.target, ctx.rhs);
    }
}
