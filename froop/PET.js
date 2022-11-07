import { PE } from "./PE.js";
export class PET extends PE {
    async re(instance, originMethodName, vals) {
        await super.do(instance, originMethodName, [vals[0], vals[1]]);
        const { Tx } = await import('../lib/Tx.js');
        const dt = vals[2];
        const tx = new Tx(instance, instance, dt.match, dt.scope);
        await tx.transform();
    }
}
