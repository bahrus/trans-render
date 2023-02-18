import {PropertyBag} from './PropertyBag.js';
import {getQuery} from './specialKeys.js';
import { upSearch } from './upSearch.js';
import {ICtxNav, Islet, freeText, ExpectedCamelQry} from './types';

export class CtxNav<T = any> implements ICtxNav{

    #ref: WeakRef<Element>
    constructor(self: Element){
        this.#ref = new WeakRef(self);
    }

    get itemscope(): CtxNav<T> | undefined{
        return this.$;
    }

    get $(): CtxNav<T> | undefined{
        const ref = this.ref?.closest('[itemscope]');
        if(ref) return new CtxNav(ref);

    }

    get beScoped(): EventTarget | undefined{
        const ref = this.ref;
        if(ref === undefined) return undefined;
        let returnObj = (<any>ref).beDecorated?.scoped?.scope;
        if(returnObj !== undefined) return returnObj;
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

    xtalState(): Promise<EventTarget | undefined>{
        return new Promise<EventTarget|undefined>(resolve => {
            const ref = this.ref;
            if(ref === undefined) {
                resolve(undefined);
                return;
            }
            let {xtalState} = ref as any;
            if(xtalState !== undefined) {
                resolve(xtalState);
                return;
            }
            ref.addEventListener('#resolved', e => {
                resolve((ref as any).xtalState);
                return; 
            }, {once: true});
        })

    }
    

    get ref(){
        return this.#ref.deref();
    }

    get ancestor(): ExpectedCamelQry<T>{
        const ref = this.#ref;
        return new Proxy({}, {
            get(obj: any, prop: string){
                const qry = getQuery(prop);
                const closest = ref.deref()?.closest(qry.query);
                if(closest){
                    return new CtxNav(closest) as CtxNav<T>;
                }
            }
        }) as ExpectedCamelQry<T>;
    }

    get elder(): ExpectedCamelQry<T>{
        const ref = this.#ref;
        return new Proxy({}, {
            get(obj: any, prop: string){
                const qry = getQuery(prop);
                const realRef = ref.deref();
                if(realRef === undefined) return undefined;
                const closest = upSearch(realRef, qry.query);
                if(closest){
                    return new CtxNav(closest);
                }
            }
        }) as ExpectedCamelQry<T>;
    }

    get hostCtx(): CtxNav<T> | undefined{
        const host = this.host;
        return host === undefined ? undefined : new CtxNav(host) as CtxNav<T>;
    }

    get host(){
        const ref = this.#ref.deref();
        if(ref === undefined) return undefined;
        const host = (<any>ref.getRootNode()).host;
    }

    async nav(to: string){
        const {getVal} = await import('./getVal.js');
        return await getVal({host: this}, to);
    }
}