export class SplitText {
    do(ctx) {
        const textNodes = ctx.rhs;
        const host = ctx.host;
        if (host === undefined)
            throw "No host";
        if (textNodes.length === 1) {
            ctx.target.textContent = host[textNodes[0]];
        }
        ctx.target.textContent = interpolate(textNodes, host);
    }
}
export function interpolate(textNodes, host) {
    return textNodes.map((val, idx) => {
        if (idx % 2 === 0)
            return val;
        return host[val];
    }).join('');
}
