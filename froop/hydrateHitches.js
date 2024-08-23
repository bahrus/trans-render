import { tryParse } from '../lib/prs/tryParse.js';
import { EventHandler } from '../EventHandler.js';
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
        const { propagator, disconnectedSignal } = vm;
        const { middleKey, leftKey } = hs;
        this.#mkAC = new AbortController();
        EventHandler.new(this, this.#hydrate).sub(propagator, middleKey, { signal: this.#mkAC.signal });
        this.#lkAC = new AbortController();
        EventHandler.new(this, this.#hydrate).sub(propagator, leftKey, { signal: this.#lkAC.signal });
        disconnectedSignal.addEventListener('abort', () => {
            this.#disconnect();
            this.#disconnectLKAndMK();
        }, { once: true });
        this.#hydrate(this);
    }
    #disconnectLKAndMK() {
        if (this.#lkAC !== undefined)
            this.#lkAC.abort();
        if (this.#mkAC !== undefined)
            this.#mkAC.abort();
    }
    #disconnect() {
        if (this.#ac !== undefined)
            this.#ac.abort();
        this.#ac = new AbortController();
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
        self.#disconnect();
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
