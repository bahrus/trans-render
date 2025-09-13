import { splitOnce } from "../lib/splitOnce";
export class ExtHandler {
    key;
    options;
    #targetRef;
    #prop;
    constructor(extSrc, target, key, options) {
        this.key = key;
        this.options = options;
        const { on } = options;
        this.#targetRef = new WeakRef(target);
        extSrc.addEventListener(on, this);
    }
    handleEvent(e) {
        if (this.#prop === undefined) {
            const { key } = this;
            const [, prop] = splitOnce(key, 'inc_');
            this.#prop = prop;
        }
        const prop = this.#prop;
        const target = this.#targetRef.deref();
        if (target === undefined)
            return;
        if (!target[prop]) {
            target[prop] = 1;
        }
        else {
            target[prop]++;
        }
        const stopPropagation = this.options.stopPropagation;
        if (stopPropagation)
            e.stopPropagation();
    }
}
