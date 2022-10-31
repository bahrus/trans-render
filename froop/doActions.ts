import {Action, ActionOnEventConfigs} from '../lib/types';
export async function doActions(instance: EventTarget, actions: {[methodName: string]: Action}){
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
            const {PE} = await import('./PE.js');
            const pe = new PE();
            pe.do(instance, method, ret as [any, ActionOnEventConfigs]);
        }else{
            Object.assign(instance, ret);
        }
    }
}