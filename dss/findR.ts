import { Specifier } from "../ts-refs/trans-render/dss/types";

async function getHostish(el: Element, prop?: string){
    const {localName, host} = el as any;
    if(host) return host;
    if(localName.includes('-')){
        await customElements.whenDefined(localName);
        if(prop){
            if(prop in el) return el;
        }
    }
    const itemScopeAttr = el.getAttribute('itemscope');
    if(itemScopeAttr){
        let host = (<any>el).host as HTMLElement | undefined;
        if(host) return getHostish(host, prop);
        const {AttachedHost, waitForEvent} = await import('./AttachedHost.js');
        const ah = new AttachedHost(el);
        if(!ah.isResolved){
            await waitForEvent(ah, 'resolved');
        }
        host = (<any>el).host as HTMLElement | undefined;
        if(host) return getHostish(host, prop);
        
    }
}
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
                    const hostish = getHostish(closest, prop);
                    if(hostish) return hostish;
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