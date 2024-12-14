const cache = new Map();
export function activate(jsExpr) {
    if (cache.has(jsExpr))
        return cache.get(jsExpr);
    const guid = `a_${crypto.randomUUID()}`;
    const JSExpr = `
    document.currentScript['${guid}'] = e => {
        with(e.target){
            ${jsExpr}
        }
    }
    `;
    const script = document.createElement('script');
    script.innerHTML = JSExpr;
    document.head.appendChild(script);
    const handler = script[guid];
    cache.set(jsExpr, handler);
    return handler;
}
