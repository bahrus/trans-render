const cache = new Map<string, (e: Event) => void>();
export function activate(jsExpr: string){
    if(cache.has(jsExpr)) return cache.get(jsExpr)!;
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
    const handler = (<any>script)[guid] as (e: Event) => void;
    return handler;
}