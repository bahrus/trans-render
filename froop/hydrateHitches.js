import { tryParse } from '../lib/prs/tryParse.js';
const reHitches = [
    {
        regExp: new RegExp(String.raw `^(?<lOp>when)_(?<leftKey>[\w]+)_(?<lmOp>emits)_(?<middleKey>[\w]+)_(?<mrOp>inc)_(?<rightKey>[\w]+)_(?<rOp>by)`),
        defaultVals: {}
    }
];
export function hydrateHitches(hitches, ra) {
    for (const key in hitches) {
        const test = tryParse(key, reHitches);
        if (test === null)
            throw 400;
        const hm = new HitchManager(test, hitches[key], ra);
    }
}
class HitchManager {
    #ac;
    #hs;
    #rhs;
    #ra;
    constructor(hs, rhs, ra) {
        this.#hs = hs;
        this.#rhs = rhs;
        this.#ra = ra;
        const { options } = ra;
        const { vm } = options;
        const { propagator } = vm;
        const { middleKey, leftKey } = hs;
        propagator.addEventListener(middleKey, (e) => {
            this.#hydrate();
        });
        propagator.addEventListener(leftKey, (e) => {
            this.#hydrate();
        });
        propagator.addEventListener('disconnectedCallback', (e) => {
            if (this.#ac !== undefined)
                this.#ac.abort();
        });
        this.#hydrate();
    }
    #hydrate() {
        const { options } = this.#ra;
        const { vm } = options;
        const { leftKey, middleKey, rightKey, mrOp } = this.#hs;
        const eventTarget = vm[leftKey];
        if (eventTarget === undefined)
            return;
        const eventProp = vm[middleKey];
        if (eventProp === undefined)
            return;
        if (this.#ac !== undefined) {
            this.#ac.abort();
        }
        this.#ac = new AbortController();
        eventTarget.addEventListener(eventProp, e => {
            switch (mrOp) {
                case 'inc':
                    vm[rightKey] += this.#rhs;
                    break;
            }
        }, { signal: this.#ac.signal });
    }
}
