import {ActionOnEventConfigs, DynamicTransform} from './types';
import {Action} from  '../lib/types';
export async function act(instance: EventTarget, actions: {[methodName: string]: Action}){
    for(const methodName in actions){
        const action = actions[methodName];
        if(action.debug) debugger;
        const method = (<any>instance)[methodName];
        if(method === undefined) throw {
            msg: 404, methodName, instance
        }
        const isAsync = method.constructor.name === 'AsyncFunction';
        const ret = isAsync ? await (<any>instance)[methodName](instance) : (<any>instance)[methodName](instance);
        if(ret === undefined) continue;
        if(Array.isArray(ret)){
            switch(ret.length){
                case 2:
                    const {PE} = await import('./PE.js');
                    const pe = new PE();
                    await pe.do(instance, methodName, ret as [any, ActionOnEventConfigs]);
                    break;
                case 3:
                    const {PET} = await import('./PET.js');
                    const pet = new PET();
                    await pet.re(instance, methodName, ret as [any, ActionOnEventConfigs, DynamicTransform])
            }

        }else{
            Object.assign(instance, ret);
        }
    }
}