import { PE } from "./PE.js";
export class PET extends PE {
    //#transformers = new Map<string, ITx>()
    async re(instance, originMethodName, vals) {
        throw 'NI';
        // await super.do(instance, originMethodName, [vals[0], vals[1]]);
        // const dt = vals[2];
        // if(dt !== undefined){
        //     let tx = this.#transformers.get(originMethodName);
        //     if(tx === undefined){
        //         const {Tx} = await import('../lib/Tx.js');
        //         tx = new Tx(instance, instance as Element, dt.transform, dt.scope || 'sd');
        //         if(!dt.noCache){
        //             this.#transformers.set(originMethodName, tx);
        //         }
        //     }else{
        //         tx.match = dt.transform;
        //         tx.scope = dt.scope || 'sd';
        //     }
        //     tx.make = dt.make;
        //     await tx.transform();
        //     if((<any>instance).mntCnt > 0){
        //         (<any>instance).mntCnt--;
        //     }
        // }
    }
}
