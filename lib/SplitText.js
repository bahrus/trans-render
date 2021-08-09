export class SplitText {
    do(ctx) {
        const textNodes = ctx.rhs;
        const host = ctx.host;
        if (host === undefined)
            throw "No host";
        if (textNodes.length === 1) {
            return host[textNodes[0]];
        }
        const evNodes = textNodes.map((val, idx) => {
            if (idx % 2 === 0)
                return val;
            return host[val];
        });
        ctx.target.textContent = evNodes.join('');
    }
}
