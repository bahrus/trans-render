import {HydrateOptions, ICtxNav} from './types';
import {camelToLisp} from './camelToLisp.js';
import {getQuery} from './specialKeys.js';

export class Hydrator<THomeObj = any>{
    constructor(fragment: DocumentFragment, options: HydrateOptions, homeObj: THomeObj){
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
                if(elementsToObserve === undefined || elementsToObserve.length === 0) continue;
                const {do: doeth, affect} = options;
                let affectPath = affect || 'host';
                for(const elementToObserve of elementsToObserve){
                    elementToObserve.addEventListener(eventName, async e => {
                        for(const action of doeth){
                            const {invoke, by, inc, set, eq, eqTo, toggle, affect} = action;
                            affectPath = affect || affectPath;
                            const {CtxNav} = await import('./CtxNav.js');
                            const ctxNav = new CtxNav(elementToObserve);
                            const target = await ctxNav.nav(affectPath);
                            if(inc){

                            }
                            if(invoke){
                                target[invoke](target, homeCtx, e);
                            }
                        }
                    });
                }
            }
        }
    }
}