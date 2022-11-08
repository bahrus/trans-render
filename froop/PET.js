import { PE } from "./PE.js";
export class PET extends PE {
    #transformers = new Map();
    async re(instance, originMethodName, vals) {
        await super.do(instance, originMethodName, [vals[0], vals[1]]);
        const dt = vals[2];
        if (dt !== undefined) {
            let tx = this.#transformers.get(originMethodName);
            if (tx === undefined) {
                const { Tx } = await import('../lib/Tx.js');
                tx = new Tx(instance, instance, dt.match, dt.scope || "sd");
                if (!dt.noCache) {
                    this.#transformers.set(originMethodName, tx);
                }
            }
            else {
                tx.match = dt.match;
                tx.scope = dt.scope;
            }
            await tx.transform();
        }
    }
}
