export async function find(element, specifier, within) {
    const { self, s } = specifier;
    if (self)
        return element;
    if (s === '#' || within !== undefined) {
        const { arr } = await import('../arr.js');
        const { elS } = specifier;
        const rns = (arr(within) || [element.getRootNode()]);
        for (const rn of rns) {
            if (s === '#') {
                const el = (s === '#' && rn instanceof DocumentFragment) ? rn.getElementById(elS) : rn.querySelector('#' + elS);
                if (el !== null)
                    return el;
            }
        }
    }
    const { findR } = await import('./findR.js');
    return await findR(element, specifier, undefined);
}
export function getSubProp(specifier, el) {
    const { path } = specifier;
    return path || el.getAttribute('itemprop') || el.name || el.id;
}
