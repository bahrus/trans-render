export class EchoCompact {
    srcProp;
    destProp;
    echoBy;
    vm;
    #abortController = new AbortController();
    constructor(srcProp, destProp, echoBy, vm) {
        this.srcProp = srcProp;
        this.destProp = destProp;
        this.echoBy = echoBy;
        this.vm = vm;
        this.#do();
    }
    async #do() {
        const { vm, srcProp } = this;
        const { propagator } = vm;
        if (!(propagator instanceof EventTarget))
            return;
        propagator.addEventListener('disconnectedCallback', e => {
            this.#disconnect();
        }, { once: true });
        propagator.addEventListener(srcProp, e => {
            this.#doEcho();
        }, { signal: this.#abortController.signal });
        this.#doEcho();
    }
    async #doEcho() {
        const { vm, srcProp, destProp } = this;
        const { delay } = this.echoBy;
        const echoDelayNum = typeof (delay) === 'number' ? delay : vm[delay];
        const currVal = vm[srcProp];
        setTimeout(() => {
            vm[destProp] = currVal;
        }, echoDelayNum);
    }
    #disconnect() {
        this.#abortController.abort();
    }
}
