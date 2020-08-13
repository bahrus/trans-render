function stamp(fragment, attr, refs, ctx) {
    const target = ctx.host || ctx.cache;
    Array.from(fragment.querySelectorAll(`[${attr}]`)).forEach(el => {
        const val = el.getAttribute(attr);
        const sym = refs[val];
        if (sym !== undefined) {
            target[sym] = el;
        }
    });
}
function fromTuple(ctx, pia) {
    stamp(ctx.target, 'id', pia[1], ctx);
}
export const templStampSym = Symbol.for('Dd5nJwRNaEiFtfam5oaSkg');
export const plugin = {
    fn: fromTuple,
    sym: templStampSym
};
