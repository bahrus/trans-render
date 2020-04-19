//singleton symbols.
export async function getSymbol(customElementName, symbolName) {
    await customElements.whenDefined(customElementName);
    return customElements.get(customElementName)[symbolName];
}
export async function setSymbol(customElementName, symbolName) {
    if (getSymbol(customElementName, symbolName) !== undefined)
        return;
    await customElements.whenDefined(customElementName);
    return customElements.get(customElementName)[symbolName] = Symbol(symbolName);
}
