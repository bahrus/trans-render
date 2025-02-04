export const publicPrivateStore = Symbol();
//define a mixin class called RRMixin that implements RoundaboutReady
export function RRMixin(Base) {
    class RR extends Base {
        propagator = new EventTarget();
        [publicPrivateStore] = {};
        #disconnectedAbortController;
        get disconnectedSignal() {
            return this.#disconnectedAbortController.signal;
        }
        constructor(...rest) {
            super();
            this.#disconnectedAbortController = new AbortController();
        }
        sleep;
        awake() {
            return new Promise((resolve, reject) => {
                if (!this.sleep) {
                    resolve();
                    return;
                }
                const ac = new AbortController();
                //I'm thinking this one isn't worth wrapping in an EventHandler, as the "closure"
                //isn't accessing anything other than the resolve and abort controller, doesn't seem worth it.
                this.propagator.addEventListener('sleep', e => {
                    if (!this.sleep) {
                        ac.abort();
                        resolve();
                    }
                }, { signal: ac.signal });
            });
        }
        nudge() {
            const { sleep } = this;
            this.sleep = sleep ? sleep - 1 : 0;
        }
        rock() {
            const { sleep } = this;
            this.sleep = sleep === undefined ? 1 : sleep + 1;
        }
    }
    return RR;
}
