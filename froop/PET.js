import { PE } from "./PE.js";
export class PET extends PE {
    #transformers = new Map();
    async re(instance, originMethodName, vals) {
        await super.do(instance, originMethodName, [vals[0], vals[1]]);
        const dt = vals[2];
        if (dt !== undefined) {
            const { Tx } = await import('../lib/Tx.js');
            const tx = new Tx(instance, instance, dt.match, dt.scope || "sd");
            await tx.transform();
        }
    }
}
