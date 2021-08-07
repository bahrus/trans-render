const weakMap = new WeakMap();
export class InTexter {
    do(ctx) {
        let text = ctx.rhs;
        const target = ctx.target;
        if (ctx.host !== undefined && text.includes('|')) {
            if (!weakMap.has(target)) {
                const split = text.split('|');
                weakMap.set(target, split.map(s => {
                    if (s[0] !== '.')
                        return s;
                    const optionalChain = s.split('??'); //todo trimend only -- waiting for universal browser support
                    return optionalChain.length === 1 ? optionalChain[0] : optionalChain;
                }));
            }
        }
        target.textContent = text;
    }
}
