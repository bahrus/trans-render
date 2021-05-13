export function getShadowRoot(el: HTMLElement, maxLevel: number): Node | undefined{
    let shadowRoot = el.getRootNode();
    if(maxLevel === 0) return shadowRoot;
    if((<any>shadowRoot).host) return getShadowRoot((<any>shadowRoot).host as HTMLElement, maxLevel - 1);
    return undefined;
}