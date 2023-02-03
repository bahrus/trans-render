import {PropertyBag} from './PropertyBag.js';
import {getQuery} from './specialKeys.js';
import { upSearch } from './upSearch.js';

export class ScopeNavigator{

    #ref: WeakRef<Element>
    constructor(self: Element){
        this.#ref = new WeakRef(self);
    }

    get scope(): EventTarget | undefined{
        let returnObj = (<any>this.#ref.deref()).beDecorated?.scoped?.scope;
        if(returnObj !== undefined) return returnObj;
        const ref = <any>this.#ref.deref();
        if(ref === undefined) return undefined;
        if(ref.beDecorated === undefined){
            ref.beDecorated = {};
        }
        const bd = ref.beDecorated;
        if(bd.scoped === undefined){
            bd.scoped = {};
        }
        const pg = new PropertyBag();
        bd.scoped.scope = pg.proxy;
        return pg.proxy;
    }

    get self(){
        return this.#ref.deref();
    }

    get ancestor(): any{
        const ref = this.#ref;
        return new Proxy({}, {
            get(obj: any, prop: string){
                const qry = getQuery(prop);
                const closest = ref.deref()?.closest(qry.query);
                if(closest){
                    return new ScopeNavigator(closest);
                }
            }
        });
    }

    get elder(): any{
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
        });
    }
}