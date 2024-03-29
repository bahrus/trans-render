import { Specifier } from "./types";

export async function findR(element: Element, specifier: Specifier, scopeE?: Element | undefined){
    const {scopeS, elS} = specifier;
    
    if(scopeS !== undefined && elS !== undefined){
        const {dss, rec, rnf} = specifier;
        switch(dss){
            case '^':
                const {parentElement} = (scopeE || element);
                const closest = parentElement?.closest(scopeS);
                const found = closest?.querySelector(elS);
                if(found) return found;
                if(rec && closest) return await findR(element, specifier, closest);
                if(rnf){
                    const rn = element.getRootNode() as DocumentFragment;
                    return rn?.querySelector(elS);
                }
                return null;
            case '?':
                throw 'NI';
            case 'Y':
                throw 'NI'
        }
    }
}