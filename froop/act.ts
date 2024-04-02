import {ActionOnEventConfigs, DynamicTransform, IPE, IPET} from './types';
import {Action} from  './types';
const PELookup = new WeakMap<EventTarget, IPE>();
const PETLookup = new WeakMap<EventTarget, IPET>();
export async function act(instance: EventTarget, actions: {[methodName: string]: Action}){
    for(const methodName in actions){
        const action = actions[methodName];
        const {debug, secondArg} = action;
        if(debug) debugger;
        const method = (<any>instance)[methodName];
        if(method === undefined) throw {
            msg: 404, methodName, instance
        }
        const isAsync = method.constructor.name === 'AsyncFunction';
        const ret = isAsync ? await (<any>instance)[methodName](instance, secondArg) : (<any>instance)[methodName](instance, secondArg);
        if(typeof ret !== 'object') continue;
        await apply(instance, ret, methodName);
    }
}

export async function apply(instance: EventTarget, ret: any, methodName: string){
    if(Array.isArray(ret)){
        //TODO:  deprecate this in favor of attaching enhancements including be-voke
        switch(ret.length){
            case 2:
                let pe = PELookup.get(instance);
                if(pe === undefined){
                    const {PE} = await import('./PE.js');
                    pe = new PE();
                    PELookup.set(instance, pe);
                }
                await pe.do(instance, methodName, ret as [any, ActionOnEventConfigs]);
                break;
            // case 3:
            //     let pet = PETLookup.get(instance);
            //     if(pet === undefined){
            //         const {PET} = await import('./PET.js');
            //         pet = new PET();
            //         PETLookup.set(instance, pet);
            //     }
            //     await pet.re(instance, methodName, ret as [any, ActionOnEventConfigs, DynamicTransform]);
        }

    }else{
        //Object.assign(instance, ret);
        assign(instance, ret);
    }
}

export function assign(instance: any, ret: any){
    for(const key in ret){
        const val = ret[key];
        const isElement = instance instanceof Element;
        if(isElement){
            if(key.startsWith('* ')){
                //untested
                const matches = Array.from(((<any>instance).clonedTemplate || instance.shadowRoot || instance).querySelectorAll(key.substring(2)));
                for(const match of matches){
                    assign(match, val);
                }
                continue;
            }
            if(key.startsWith(' ')){
                //set attribute
                const attr = key.substring(1);
                if(val === null || val === undefined || val === false){
                    instance.removeAttribute(attr);
                    continue;   
                }
                instance.setAttribute(attr, val.toString());
            }
            if(key.startsWith('+')){
                //untested
                if((<any>instance).beEnhanced=== undefined){
                    (<any>instance).beEnhanced = {};
                }
                const {beEnhanced} = <any>instance;
                const path = key.substring(1);
                if(beEnhanced[path] === undefined){
                    beEnhanced[path] = {};
                }
                const enhancement = beEnhanced[path];
                assign(enhancement, ret); 
                continue;
            }
        } 

        if(instance instanceof HTMLElement){
            switch(key){
                case 'style':
                case 'dataset':
                    assign(instance[key], val);
                    continue;
            }
        }
        instance[key] = val;
        
    }
}