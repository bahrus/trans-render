import { PE } from "./PE.js";
import {ActionOnEventConfigs, DynamicTransform, IPET} from './types';
import { AttribsSettings, Matches, ITx } from '../lib/types';

export class PET extends PE implements IPET{
    #transformers = new Map<string, ITx>()
    async re(instance: EventTarget, originMethodName: string, vals: [any, ActionOnEventConfigs, DynamicTransform] ){
        await super.do(instance, originMethodName, [vals[0], vals[1]]);
        const dt = vals[2];
        if(dt !== undefined){
            let tx = this.#transformers.get(originMethodName);
            if(tx === undefined){
                const {Tx} = await import('../lib/Tx.js');
                tx = new Tx(instance, instance as Element, dt.match, dt.scope || "sd");
                if(!dt.noCache){
                    this.#transformers.set(originMethodName, tx);
                }
            }else{
                tx.match = dt.match;
                tx.scope = dt.scope;
            }
            await tx.transform();
            
        }
        

    }
}