//singleton symbols.

//use async if using dynamic import
export async function getSymbolAsync(customElementName: string, symbolName: string){
    await customElements.whenDefined(customElementName);
    return customElements.get(customElementName)[symbolName] as symbol;
}

export async function setSymbolAsync(customElementName: string, symbolName: string){
    const test = await getSymbolAsync(customElementName, symbolName);
    if(test !== undefined) return test;
    return setSymbol(customElementName, symbolName);
}


export function getSymbol(customElementName: string, symbolName: string){
    return customElements.get(customElementName)[symbolName] as symbol;
}

export function setSymbol(customElementName: string, symbolName: string){
    const existingSymbol = getSymbol(customElementName, symbolName);
    if(existingSymbol !== undefined) return existingSymbol;
    const newSymbol = Symbol(symbolName);
    customElements.get(customElementName)[symbolName] = newSymbol;
    return newSymbol;
}

export function setSymbols(customElementName: string, symbolNames: string[]){
    return symbolNames.map(s => setSymbol(customElementName, s));
}