import { PE } from "./PE.js";
import {ActionOnEventConfigs, DynamicTransform} from './types';
import { AttribsSettings, Matches } from '../lib/types';

export class PET extends PE{
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