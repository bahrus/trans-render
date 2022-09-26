export class Tx {
    realmCitizen;
    transformScope;
    #ctx;
    #realm;
    constructor(host, realmCitizen, match, transformScope) {
        this.realmCitizen = realmCitizen;
        this.transformScope = transformScope;
        this.#ctx = {
            match,
            host,
            initiator: realmCitizen
        };
    }
    async #getRealm() {
        if (this.#realm !== undefined) {
            const deref = this.#realm.deref();
            if (deref !== undefined)
                return deref;
        }
        const { transformScope, realmCitizen } = this;
        if (transformScope.parent) {
            const parent = realmCitizen.parentElement;
            if (parent !== null) {
                this.#realm = new WeakRef(parent);
                return parent;
            }
        }
        const { closest } = transformScope;
        if (closest !== undefined) {
            const nearest = realmCitizen.closest(closest);
            return realmCitizen.closest(closest);
        }
        const { getHost } = await import('trans-render/lib/getHost.js');
        const rn = (getHost(realmCitizen, true) || document);
        this.#realm = new WeakRef(rn);
        return rn;
    }
    async transform() {
        const { DTR } = await import('trans-render/lib/DTR.js');
        await DTR.transform(await this.#getRealm(), this.#ctx);
    }
}
