import { Specifier } from "./types";

export async function find(element: Element, specifier: Specifier){
    const {self, s} = specifier;
    if(self) return element;
    if(s === '#'){
        const {elS} = specifier;
        return (element.getRootNode() as DocumentFragment).getElementById(elS!);
    }
    const {findR} = await import('./findR.js');
    return await findR(element, specifier);
}

