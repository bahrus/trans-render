import { PE } from "./PE.js";
import {ActionOnEventConfigs, DynamicTransform, IPET} from './types';
import { AttribsSettings, Matches, ITx } from '../lib/types';

export class PET extends PE implements IPET{
    #transformers = new Map<string, ITx>()
    async re(instance: EventTarget, originMethodName: string, vals: [any, ActionOnEventConfigs, DynamicTransform] ){
        await super.do(instance, originMethodName, [vals[0], vals[1]]);
        const dt = vals[2];
        if(dt !== undefined){
            const {Tx} = await import('../lib/Tx.js');
            const tx = new Tx(instance, instance as Element, dt.match, dt.scope || "sd");
            await tx.transform();
        }
        

    }
}