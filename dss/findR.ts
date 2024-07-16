import { Specifier } from "./types";

export async function findR(element: Element, specifier: Specifier, scopeE?: Element | undefined){
    const {scopeS, elS} = specifier;
    
    if(scopeS !== undefined){
        const {dss, rec, rnf, host, s, prop} = specifier;
        switch(dss){
            case '^':
                const {parentElement} = (scopeE || element);
                const closest = parentElement?.closest(scopeS);
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