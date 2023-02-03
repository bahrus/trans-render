import {PropertyBag} from './PropertyBag.js';
import {getQuery} from './specialKeys.js';
import { upSearch } from './upSearch.js';
import {IScopeNavigator} from './types';

export class ScopeNavigator<T = any> implements IScopeNavigator{

    #ref: WeakRef<Element>
    constructor(self: Element){
        this.#ref = new WeakRef(self);
    }

    get scope(): EventTarget | undefined{
        let returnObj = (<any>this.#ref.deref()).beDecorated?.scoped?.scope;
        if(returnObj !== undefined) return returnObj;
        const ref = this.#ref.deref();
        if(ref === undefined) return undefined;
        if((<any>ref).beDecorated === undefined){
            (<any>ref).beDecorated = {};
        }
        const bd = (<any>ref).beDecorated;
        if(bd.scoped === undefined){
            bd.scoped = {};
        }
        const pg = new PropertyBag();
        bd.scoped.scope = pg.proxy;
        bd.scoped.nav = this;
        ref.setAttribute('itemscope', '');
        return pg.proxy;
    }

    get self(){
        return this.#ref.deref();
    }

    get ancestor(): T{
        const ref = this.#ref;
        return new Proxy({}, {
            get(obj: any, prop: string){
                const qry = getQuery(prop);
                const closest = ref.deref()?.closest(qry.query);
                if(closest){
                    return new ScopeNavigator(closest);
                }
            }
        }) as T;
    }

    get elder(): T{
        const ref = this.#ref;
        return new Proxy({}, {
            get(obj: any, prop: string){
                const qry = getQuery(prop);
                const realRef = ref.deref();
                if(realRef === undefined) return undefined;
                const closest = upSearch(realRef, qry.query);
                if(closest){
                    return new ScopeNavigator(closest);
                }
            }
        }) as T;
    }

    get host(): T | undefined{
        const ref = this.#ref.deref();
        if(ref === undefined) return undefined;
        const host = (<any>ref.getRootNode()).host;
        if(host === undefined) return undefined;
        return new ScopeNavigator(host) as T;
    }
}