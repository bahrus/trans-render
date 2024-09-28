export function stdProp(el) {
    if (el.hasAttribute('itemprop')) {
        return el.getAttribute('itemprop')?.split(' ')[0];
    }
    return el.name || el.id;
}
