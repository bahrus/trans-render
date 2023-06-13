/**
 * Purpose:  Manage repeated transforms for scenario where transform is externally triggered as opposed to being auto triggered via subscribe.
 */
export class Tx {
    #ctx;
    #realm;
    #scope;
    constructor(host, realmCitizen, match, scope) {
        this.#ctx = {
            match,
            host,
            $0: realmCitizen
        };
        this.#scope = scope;
    }
    set match(nv) {
        this.#ctx.match = nv;
    }
    set make(nv) {
        this.#ctx.make = nv;
    }
    set scope(nv) {
        if (this.#scope !== nv) {
            this.#realm = undefined;
        }
        this.#scope = nv;
    }
    async #getRealm() {
        if (this.#realm !== undefined) {
            const deref = this.#realm.deref();
            if (deref !== undefined)
                return deref;
        }
        const { findRealm } = await import('./findRealm.js');
        const rn = await findRealm(this.#ctx.$0, this.#scope);
        if (!rn)
            throw '404';
        this.#realm = new WeakRef(rn);
        return rn;
    }
    async transform() {
        const { DTR } = await import('trans-render/lib/DTR.js');
        await DTR.transform(await this.#getRealm(), this.#ctx);
    }
}
