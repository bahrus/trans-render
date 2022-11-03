import {r} from './const.js';
import {IResolvableService} from './types';

export class ReSvc extends EventTarget implements IResolvableService{
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

}