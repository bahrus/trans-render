function fromTuple(ctx, pia) {
    const target = ctx.target;
    if (target === undefined || target === null)
        return;
    target.innerHTML = pia[1];
}
export const unsafeHTMLSym = Symbol.for('ol5uc/x6b06k3qghWKq6nA==');
export const plugin = {
    fn: fromTuple,
    sym: unsafeHTMLSym
};
