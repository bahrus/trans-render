export class Texter {
    do(ctx) {
        ctx.target.textContent = ctx.rhs;
    }
}
