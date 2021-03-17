export function getHost(el, maxLevel) {
    let parent = el.getRootNode();
    if (maxLevel === 0)
        return parent;
    if (parent.host)
        return getHost(parent.host, maxLevel - 1);
    return undefined;
}
