import {ActionOnEventConfigs, IPE} from './types';
import {assign} from './act.js';

export class PE implements IPE{
    #abortControllers = new Map<string, AbortController[]>();

    async do(instance: EventTarget, originMethodName: string, vals: [any, ActionOnEventConfigs] ){
        this.disconnect(originMethodName);
        instance.addEventListener('disconnected-callback', e => {
            this.disconnectAll();
        }, {once: true});
        if(vals[0] !== undefined){
            assign(instance, vals[0]);
        }
        if(vals[1] !== undefined){
            //TODO map abort controllers first off of "of"
            //similar to be-decorated/PE.ts
            for(const methodName in vals[1]){
                const ec = vals[1][methodName]!;
                const {of, doInit, on, abort} = ec;
                if(abort !== undefined){
                    const {of, origMethName, on} = abort
                    if(!(of instanceof EventTarget)) throw {abort};
                    const acs = this.#abortControllers.get(origMethName);
                    if(acs !== undefined){
                        for(const ac of acs){
                            ac.abort();
                        }
                        this.#abortControllers.delete(origMethName);
                    }
                    return;
                }
                if(on !== undefined){
                    if(!(of instanceof EventTarget)) throw {ec};
                    const ac = new AbortController();
                    const method = (<any>instance)[methodName];
                    const isAsync = method.constructor.name === 'AsyncFunction';
                    //console.log({method, isAsync, key, ec});
                    of.addEventListener(on!, async e => {
                        const ret = isAsync ? await (<any>instance)[methodName](instance, e) : (<any>instance)[methodName](instance, e);
                        //console.log({ret});
                        await this.recurse(instance, methodName, ret);
                    }, {signal: ac.signal});
                    this.#abortControllers.get(originMethodName)!.push(ac);
                    if(doInit){
                        const ret = isAsync ? await (<any>instance)[methodName](instance) : (<any>instance)[methodName](instance);
                        await this.recurse(instance, methodName, ret);
                    }
                }

            }
        }
    }

    async recurse(instance: EventTarget, methodName: string, ret: any){
        if(ret === undefined) return;
        const arg = (Array.isArray(ret) ? ret : [ret]) as [any, ActionOnEventConfigs] ;
        const pe = new PE();
        await pe.do(instance, methodName, arg);
    }

    disconnectAll(){
        for(const key of this.#abortControllers.keys()){
            this.disconnect(key);
        }
    }

    disconnect(methodName: string){
        if(this.#abortControllers.has(methodName)) {
            const abortControllers = this.#abortControllers.get(methodName)!;
            for(const c of abortControllers){
                c.abort();
            }
        }
        this.#abortControllers.set(methodName, []);
    }
}