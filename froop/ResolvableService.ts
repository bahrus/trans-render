import {r, ir} from './const.js';
export class ResolvableService<T extends object = object> extends EventTarget{
    #resolved = false;
    get resolved(){
        return this.#resolved;
    }
    set resolved(newVal){
        this.#resolved = newVal;
        if(newVal){
            this.dispatchEvent(new Event(r));
        }
    }
    resolve(): Promise<void> {
        return new Promise((resolve) => {
            if(this.#resolved) {
                resolve();
                return;
            }
            this.addEventListener(r, e => {
                resolve();
            }, {once: true});
        })
    }
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