const weakMap = new WeakMap();
export class InTexter {
    do(ctx) {
        let text = ctx.rhs;
        const target = ctx.target;
        const host = ctx.host;
        if (host !== undefined && text.includes('${') && text.includes('}') && !text.includes('(')) {
            let fn = weakMap.get(target);
            if (fn === undefined) {
                fn = eval('({ctx, host, target, idx, mode, targetProp, options, val, rhs  }) => `' + text + '`');
                weakMap.set(target, fn);
            }
            text = fn(ctx);
        }
        target.textContent = text;
    }
}
