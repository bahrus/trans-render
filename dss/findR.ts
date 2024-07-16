import { Specifier } from "./types";

export async function findR(element: Element, specifier: Specifier, scopeE?: Element | undefined){
    const {scopeS, elS} = specifier;
    
    if(scopeS !== undefined){
        const {dss, rec, rnf, host, s, prop, isiss} = specifier;
        switch(dss){
            case '^':
                let closest: Element | null | undefined;
                const seed = (scopeE || element)
                if(isiss){
                    const prev = seed.previousElementSibling || seed.parentElement;
                    if(prev ===null) throw 404;
                    const {upSearch} = await import('../lib/upSearch.js');
                    closest = upSearch(prev, scopeS);
                }else{
                    const {parentElement} = seed;
                    closest = parentElement?.closest(scopeS);
                }

                if(host && closest){
                    const {localName} = closest;
                    if(localName.includes('-')){
                        await customElements.whenDefined(localName);
                        // if(prop){
                        //     if(prop in closest) return closest;
                        // }else{
                        //     return closest;
                        // }
                        
                    }
                    const itemScopeAttr = closest.getAttribute('itemscope');
                    if(itemScopeAttr){
                        const et = (<any>closest)[itemScopeAttr];
                        if(et !== undefined) return et;
                        const {waitForEvent} = await import('../lib/isResolved.js');
                        await waitForEvent(closest, itemScopeAttr);
                        return (<any>closest)[itemScopeAttr];
                    }
                }
                if(elS === undefined) return closest;
                if(s === '~'){
                    const peerCE = ((closest || element.getRootNode()) as DocumentFragment).querySelector(elS);
                    if(peerCE){
                        await customElements.whenDefined(elS);
                        return peerCE;
                    }
                }
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
                const found = closest?.querySelector(elS);
                if(found) {
                    return found;
                }
                if(rec && closest) return await findR(element, specifier, closest);
                
                return null;
            case '?':
                throw 'NI';
            case 'Y':
                throw 'NI'
        }
    }
}