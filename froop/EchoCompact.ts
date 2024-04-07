import {EchoBy, RoundaboutReady} from './types';
export class EchoCompact{
    #abortController = new AbortController();
    constructor(public srcProp: string, public destProp: string, public echoBy: EchoBy, public vm: RoundaboutReady){
        this.#do();
    }

    async #do(){
        const {vm, srcProp} = this;
        const {propagator} = vm;
        if(!(propagator instanceof EventTarget)) return;
        propagator.addEventListener('unload', e => {
            this.#disconnect();
        }, {once: true});
        propagator.addEventListener(srcProp, e => {
            this.#doEcho();
        }, {signal: this.#abortController.signal});
        this.#doEcho();
    }

    async #doEcho(){
        const {vm, srcProp, destProp} = this;
        const {delay} = this.echoBy;
        const echoDelayNum: number = typeof(delay) === 'number' ? delay : (<any>vm)[delay];
        const currVal = (<any>vm)[srcProp];
        setTimeout(() => {
            (<any>vm)[destProp] = currVal;
        }, echoDelayNum);
    }

    #disconnect(){
        this.#abortController.abort();
    }
}