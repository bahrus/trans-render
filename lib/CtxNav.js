import { PropertyBag } from './PropertyBag.js';
import { getQuery } from './specialKeys.js';
import { upSearch } from './upSearch.js';
export class CtxNav {
    #ref;
    constructor(self) {
        this.#ref = new WeakRef(self);
    }
    get itemscope() {
        return this.$;
    }
    get $() {
        const ref = this.ref?.closest('[itemscope]');
        if (ref)
            return new CtxNav(ref);
    }
    get beScoped() {
        const ref = this.ref;
        if (ref === undefined)
            return undefined;
        let returnObj = ref.beDecorated?.scoped?.scope;
        if (returnObj !== undefined)
            return returnObj;
        if (ref.beDecorated === undefined) {
            ref.beDecorated = {};
        }
        const bd = ref.beDecorated;
        if (bd.scoped === undefined) {
            bd.scoped = {};
        }
        const pg = new PropertyBag();
        bd.scoped.scope = pg.proxy;
        bd.scoped.nav = this;
        ref.setAttribute('itemscope', '');
        return pg.proxy;
    }
    xtalState() {
        return new Promise(resolve => {
            const ref = this.ref;
            if (ref === undefined) {
                resolve(undefined);
                return;
            }
            let { xtalState } = ref;
            if (xtalState !== undefined) {
                resolve(xtalState);
                return;
            }
            ref.addEventListener('#resolved', e => {
                resolve(ref.xtalState);
                return;
            }, { once: true });
        });
    }
    get ref() {
        return this.#ref.deref();
    }
    get ancestor() {
        const ref = this.#ref;
        return new Proxy({}, {
            get(obj, prop) {
                const qry = getQuery(prop);
                const closest = ref.deref()?.closest(qry.query);
                if (closest) {
                    return new CtxNav(closest);
                }
            }
        });
    }
    get elder() {
        const ref = this.#ref;
        return new Proxy({}, {
            get(obj, prop) {
                const qry = getQuery(prop);
                const realRef = ref.deref();
                if (realRef === undefined)
                    return undefined;
                const closest = upSearch(realRef, qry.query);
                if (closest) {
                    return new CtxNav(closest);
                }
            }
        });
    }
    get hostCtx() {
        const host = this.host;
        console.log({ host });
        return host === undefined ? undefined : new CtxNav(host);
    }
    get host() {
        const ref = this.#ref.deref();
        if (ref === undefined)
            return undefined;
        const host = ref.getRootNode().host;
    }
    async nav(to) {
        const { getVal } = await import('./getVal.js');
        return await getVal({ host: this }, to);
    }
}
