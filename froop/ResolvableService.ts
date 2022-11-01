import {r} from './const.js';
export class ResolvableService extends EventTarget{
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
            if(this.#resolved) resolve();
            this.addEventListener(r, e => {
                resolve();
            }, {once: true});
        })
    }
}