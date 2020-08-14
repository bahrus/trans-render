function stamp(fragment, attr, refs, ctx) {
    const target = ctx.host || ctx.cache;
    if (target[templStampSym])
        return;
    Array.from(fragment.getRootNode().querySelectorAll(`[${attr}]`)).forEach(el => {
        const val = el.getAttribute(attr);
        const sym = refs[val];
        if (sym !== undefined) {
            target[sym] = el;
        }
    });
    target[templStampSym] = true;
}
function fromTuple(ctx, pia) {
    stamp(ctx.target, 'id', pia[1], ctx);
    stamp(ctx.target, 'part', pia[1], ctx);
}
export const templStampSym = Symbol.for('Dd5nJwRNaEiFtfam5oaSkg');
export const plugin = {
    fn: fromTuple,
    sym: templStampSym
};
