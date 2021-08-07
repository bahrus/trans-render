//const weakMap = new WeakMap<Element, Fn>();
const compiledFns = {};
export class InTexter {
    do(ctx) {
        let text = ctx.rhs;
        const target = ctx.target;
        const host = ctx.host;
        if (host !== undefined && text.includes('${') && text.includes('}') && !text.includes('(')) {
            let fn = compiledFns[text];
            if (fn === undefined) {
                fn = eval('({ctx, host, target, idx, mode, targetProp, options, val, rhs  }) => `' + text + '`');
                compiledFns[text] = fn;
            }
            text = fn(ctx);
        }
        target.textContent = text;
    }
}
