import { getHost } from 'trans-render/lib/getHost.js';
export class Tx {
    host;
    realmCitizen;
    #ctx;
    #realm;
    constructor(host, realmCitizen, match) {
        this.host = host;
        this.realmCitizen = realmCitizen;
        // const target = pram.transformFromClosest !== undefined ?
        //     proxy.closest(pram.transformFromClosest)
        //     : host.shadowRoot || host!;
        const rn = (getHost(realmCitizen, true) || document);
        this.#realm = rn.shadowRoot || rn;
        this.#ctx = {
            match,
            host,
            initiator: realmCitizen
        };
    }
    async transform() {
        const { DTR } = await import('trans-render/lib/DTR.js');
        await DTR.transform(this.#realm, this.#ctx);
    }
}
