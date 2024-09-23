import { Specifier } from "../ts-refs/trans-render/dss/types";
import {ZeroOrMore} from '../ts-refs/trans-render/types';

async function getHostish(el: Element, prop?: string){
    let {localName, ish} = el as any;
    if(localName.includes('-')){
        await customElements.whenDefined(localName);
        return el;
    }
    if(ish instanceof HTMLElement) return ish;
    const itemScopeAttr = el.getAttribute('itemscope');
    if(itemScopeAttr){
        //let ish = (<any>el).ish as HTMLElement | undefined;
        //if(host) return getHostish(host, prop);
        const {Newish, waitForEvent} = await import('./Newish.js');
        const ah = new Newish(el, itemScopeAttr);
        if(!ah.isResolved){
            await waitForEvent(ah, 'resolved');
        }
        ish = (<any>el).ish as HTMLElement | undefined;
        return ish;
        
    }
}
export async function findR(element: Element, specifier: Specifier, scopeE?: Element | undefined){
    const {scopeS, elS, isModulo} = specifier;
    
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
                    const css = `${scopeS}:has(${elS})`;
                    closest = upSearch(prev, css);
                }else{
                    const {parentElement} = seed;
                    closest = parentElement?.closest(scopeS);
                }

                if(host && closest){
                    const hostish = await getHostish(closest, prop);
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
    }else if(isModulo){
        const {modulo: m, elS} = specifier;
        const {modulo} = await import('./modulo.js'); 
        const within = modulo(element, m!);
        if(elS !== undefined) throw 'NI'; //not implemented
        return within;

        //within

    }
}