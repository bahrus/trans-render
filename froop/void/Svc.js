import { r } from './const.js';
export class Svc extends EventTarget {
    #resolved = false;
    get resolved() {
        return this.#resolved;
    }
    set resolved(newVal) {
        this.#resolved = newVal;
        if (newVal) {
            this.dispatchEvent(new Event(r));
        }
    }
    resolve() {
        return new Promise((resolve) => {
            if (this.#resolved) {
                resolve();
                return;
            }
            this.addEventListener(r, e => {
                resolve();
            }, { once: true });
        });
    }
}
