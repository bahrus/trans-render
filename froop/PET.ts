import { PE } from "./PE.js";
import {ActionOnEventConfigs, DynamicTransform} from './types';
import { Matches } from '../lib/types';

export class PET extends PE{
    async re(instance: EventTarget, originMethodName: string, vals: [any, ActionOnEventConfigs, DynamicTransform]){
        await super.do(instance, originMethodName, [vals[0], vals[1]]);
        const {Tx} = await import('../lib/Tx.js');
        const dt = vals[2];
        const tx = new Tx(instance, instance as Element, dt.match, dt.scope);
        await tx.transform();
    }
}