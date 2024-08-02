import { tryParse } from '../lib/prs/tryParse.js';
import { EventHandler } from '../EventRouter.js';
const reHitches = [
    {
        regExp: new RegExp(String.raw `^(?<lOp>when)_(?<leftKey>[\w]+)_(?<lmOp>emits)_(?<middleKey>[\w]+)_(?<mrOp>inc)_(?<rightKey>[\w]+)_(?<rOp>by)`),
        defaultVals: {}
    }
];
export async function hydrateHitches(hitches, ra) {
    for (const key in hitches) {
        const test = await tryParse(key, reHitches);
        if (test === null)
            throw 400;
        const hm = new HitchManager(test, hitches[key], ra);
    }
}
class HitchManager {
    #ac;
    #mkAC;
    #lkAC;
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
        this.#mkAC = new AbortController();
        propagator.addEventListener(middleKey, new EventHandler(this, this.#hydrate), { signal: this.#mkAC.signal });
        this.#lkAC = new AbortController();
        propagator.addEventListener(leftKey, new EventHandler(this, this.#hydrate), { signal: this.#lkAC.signal });
        propagator.addEventListener('disconnectedCallback', new EventHandler(this, this.#disconnect), { once: true });
        propagator.addEventListener('disconnectedCallback', new EventHandler(this, this.#disconnectLKAndMK), { once: true });
        this.#hydrate(this);
    }
    #disconnectLKAndMK(self) {
        if (self.#lkAC !== undefined)
            self.#lkAC.abort();
        if (self.#mkAC !== undefined)
            self.#mkAC.abort();
    }
    #disconnect(self) {
        if (self.#ac !== undefined)
            self.#ac.abort();
        self.#ac = new AbortController();
    }
    #hydrate(self) {
        const { options } = self.#ra;
        const { vm } = options;
        const { leftKey, middleKey, rightKey, mrOp } = self.#hs;
        const eventTarget = vm[leftKey];
        if (eventTarget === undefined)
            return;
        const eventProp = vm[middleKey];
        if (eventProp === undefined)
            return;
        self.#disconnect(self);
        self.#ac = new AbortController();
        eventTarget.addEventListener(eventProp, self, { signal: self.#ac.signal });
    }
    handleEvent(e) {
        const { options } = this.#ra;
        const { vm } = options;
        const { rightKey, mrOp } = this.#hs;
        switch (mrOp) {
            case 'inc':
                vm[rightKey] += this.#rhs;
                break;
        }
    }
}
