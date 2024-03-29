import { Specifier } from "./types";

export async function findR(element: Element, specifier: Specifier, scopeE?: Element | undefined){
    const {scopeS, elS} = specifier;
    
    if(scopeS !== undefined && elS !== undefined){
        const {dss, rec, rnf, host} = specifier;
        switch(dss){
            case '^':
                const {parentElement} = (scopeE || element);
                const closest = parentElement?.closest(scopeS);
                if(host && closest){
                    const {localName} = closest;
                    if(localName.includes('-')){
                        await customElements.whenDefined(localName);
                        return closest;
                    }
                }
                const found = closest?.querySelector(elS);
                if(found) {
                    return found;
                }
                if(rec && closest) return await findR(element, specifier, closest);
                if(rnf){
                    const rn = element.getRootNode() as DocumentFragment;
                    if(host && rn instanceof ShadowRoot){
                        const h = rn.host;
                        const {localName} = h;
                        if(localName.includes('-')){
                            await customElements.whenDefined(localName);
                            return h;
                        }
                    }
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