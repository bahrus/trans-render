//singleton symbols.
//use async if using dynamic import
export async function getSymbolAsync(customElementName, symbolName) {
    await customElements.whenDefined(customElementName);
    return customElements.get(customElementName)[symbolName];
}
export async function setSymbolAsync(customElementName, symbolName) {
    const test = await getSymbolAsync(customElementName, symbolName);
    if (test !== undefined)
        return test;
    return setSymbol(customElementName, symbolName);
}
export function getSymbol(customElementName, symbolName) {
    return customElements.get(customElementName)[symbolName];
}
export function setSymbol(customElementName, symbolName) {
    const existingSymbol = getSymbol(customElementName, symbolName);
    if (existingSymbol !== undefined)
        return existingSymbol;
    const newSymbol = Symbol(symbolName);
    customElements.get(customElementName)[symbolName] = newSymbol;
    return newSymbol;
}
