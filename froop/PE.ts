import {ActionOnEventConfigs, IPE} from './types';

export class PE implements IPE{
    #abortControllers = new Map<string, AbortController[]>();

    async do(instance: EventTarget, originMethodName: string, vals: [any, ActionOnEventConfigs] ){
        this.disconnect(originMethodName);
        instance.addEventListener('disconnected-callback', e => {
            this.disconnectAll();
        }, {once: true});
        if(vals[0] !== undefined){
            Object.assign(instance, vals[0]);
        }
        if(vals[1] !== undefined){
            for(const methodName in vals[1]){
                const ec = vals[1][methodName]!;
                const {of, doInit, on} = ec;
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