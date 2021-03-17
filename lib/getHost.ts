export function getHost(el: HTMLElement, maxLevel: number): Node | undefined {
    let parent = el.getRootNode();
    if(maxLevel === 0) return parent;
    if((<any>parent).host) return getHost((<any>parent).host as HTMLElement, maxLevel - 1);
    return undefined;
}