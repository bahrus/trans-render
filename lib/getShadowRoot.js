export function getShadowRoot(el, maxLevel) {
    let shadowRoot = el.getRootNode();
    if (maxLevel === 0)
        return shadowRoot;
    if (shadowRoot.host)
        return getShadowRoot(shadowRoot.host, maxLevel - 1);
    return undefined;
}
