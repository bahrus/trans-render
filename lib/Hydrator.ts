import {HydratingOptions} from './types';
import {camelToLisp} from './camelToLisp.js';
import {getQuery} from './specialKeys.js';

export class Hydrator{
    constructor(fragment: DocumentFragment, options: HydratingOptions){
        for(const key in options){
            if(key.startsWith('on') && key.endsWith('Of')){
                const strInside = key.substring(2, key.length - 2);
                const eventName = camelToLisp(strInside);
                const selector = (<any>options)[key] as string;
                const qry = getQuery(selector);
                let elementsToObserve: Element[] | undefined;
                const {query} = qry;
                if(qry.first){
                    const firstMatch = fragment.querySelector(query);
                    if(firstMatch !== null) elementsToObserve = [firstMatch];
                }else{
                    elementsToObserve = Array.from(fragment.querySelectorAll(query))
                }
                if(elementsToObserve === undefined) continue;
                const {do: doeth, affect} = options;

                for(const elementToObserve of elementsToObserve){
                    elementToObserve.addEventListener(eventName, async e => {
                        const {CtxNav} = await import('./CtxNav.js');
                        const ctxNav = new CtxNav(elementToObserve);
                        ctxNav.nav(affect || 'host');
                        for(const action of doeth){
                            const {invoke, by, inc, set, to, toVal, toggle} = action;

                        }
                    });
                }
            }
        }
    }
}