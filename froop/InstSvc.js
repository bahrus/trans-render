import { Svc } from './Svc.js';
import { ir } from './const.js';
/**
 * Instance Resolvable Service
 */
export class InstSvc extends Svc {
    #instanceResolved = new WeakMap();
    set instanceResolved(instance) {
        this.#instanceResolved.set(instance, true);
        this.dispatchEvent(new Event(ir));
    }
    instanceResolve(instance) {
        return new Promise((resolve) => {
            if (this.#instanceResolved.has(instance)) {
                resolve();
                return;
            }
            const ac = new AbortController();
            this.addEventListener(ir, e => {
                if (this.#instanceResolved.has(instance)) {
                    resolve();
                    ac.abort();
                }
            }, { signal: ac.signal });
        });
    }
}
