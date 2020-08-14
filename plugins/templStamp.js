function stamp(fragment, attr, refs, ctx) {
    const target = ctx.host || ctx.cache;
    Array.from(fragment.getRootNode().querySelectorAll(`[${attr}]`)).forEach(el => {
        const val = el.getAttribute(attr);
        const sym = refs[val];
        if (sym !== undefined) {
            target[sym] = el;
        }
    });
}
function fromTuple(ctx, pia) {
    const target = ctx.host || ctx.cache;
    if (target[templStampSym])
        return;
    stamp(ctx.target, 'id', pia[1], ctx);
    stamp(ctx.target, 'part', pia[1], ctx);
    target[templStampSym] = true;
}
export const templStampSym = Symbol.for('Dd5nJwRNaEiFtfam5oaSkg');
export const plugin = {
    fn: fromTuple,
    sym: templStampSym
};
