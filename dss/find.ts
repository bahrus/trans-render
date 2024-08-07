import { Specifier } from "../ts-refs/trans-render/dss/types";

export async function find(element: Element, specifier: Specifier, within?: Element | Array<Element>){
    const {self, s} = specifier;
    if(self) return element;
    if(s === '#'){
        const {elS} = specifier;
        //const rns = 
        return (element.getRootNode() as DocumentFragment).getElementById(elS!);
    }
    const {findR} = await import('./findR.js');
    return await findR(element, specifier);
}

export function getSubProp(specifier: Specifier, el: HTMLElement){
    const {path} = specifier;
    return path || el.getAttribute('itemprop') || (<HTMLInputElement>el).name || el.id;
}

