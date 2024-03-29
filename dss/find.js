export async function find(element, specifier) {
    const { self, s } = specifier;
    if (self)
        return element;
    if (s === '#') {
        const { elS } = specifier;
        return element.getRootNode().getElementById(elS);
    }
    const { findR } = await import('./findR.js');
    return await findR(element, specifier);
}
