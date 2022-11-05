import {Svc} from './Svc.js';
import {ir} from './const.js';
import {IInstanceResolvableService} from './types';
/**
 * Instance Resolvable Service
 */
export class InstSvc<T extends object = object> extends Svc implements IInstanceResolvableService{

    #instanceResolved = new WeakMap<T, boolean>();
    set instanceResolved(instance: T){
        this.#instanceResolved.set(instance, true);
        this.dispatchEvent(new Event(ir))
    }

    instanceResolve(instance: T): Promise<void>{
        return new Promise((resolve) => {
            if(this.#instanceResolved.has(instance)) {
                resolve();
                return;
            }
            const ac = new AbortController();
            this.addEventListener(ir, e => {
                if(this.#instanceResolved.has(instance)) {
                    resolve();
                    ac.abort();
                }
            }, {signal: ac.signal});
        })
    }

}