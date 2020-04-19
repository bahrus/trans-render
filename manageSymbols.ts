//singleton symbols.
export async function getSymbol(customElementName: string, symbolName: string){
    await customElements.whenDefined(customElementName);
    return customElements.get(customElementName)[symbolName] as symbol;
}

export async function setSymbol(customElementName: string, symbolName: string){
    if(getSymbol(customElementName, symbolName) !== undefined) return;
    await customElements.whenDefined(customElementName);
    return customElements.get(customElementName)[symbolName] = Symbol(symbolName);
}