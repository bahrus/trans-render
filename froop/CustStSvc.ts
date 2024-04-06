import { ICustomState, PropLookup, RoundaboutReady } from "./types";

export class CustStSvc{
    #abortController: Array<AbortController> = [];
    constructor(public states: PropLookup, public vm: RoundaboutReady, public internals: ElementInternals){
        this.#do();
    }

    async #do(){
        const {vm, internals} = this;
        const {propagator} = vm;
        if(!(propagator instanceof EventTarget)) return;
        propagator.addEventListener('unload', e => {
            this.disconnect();
        }, {once: true});
        const {states} = this;
        for(const stateKey in states){
            const state = states[stateKey];
            const {css} = state;
            propagator.addEventListener(stateKey, async e => {
                const customStateObj: ICustomState = typeof css === 'string' ? {
                    nameValue: css,
                } : css!;
                const {nameValue, falsy, truthy} = customStateObj;
                const nv = (<any>vm)[stateKey];
                if(nameValue !== undefined){
                    if(nv !== undefined){
                        const {camelToLisp} = await import('../lib/camelToLisp.js');
                        const valAsLisp = camelToLisp(nv.toString());
                        (<any>internals).states.add(`--${nameValue}-${valAsLisp}`);
                    }
                }
                if(truthy){
                    const verb = nv ? 'add' : 'remove';
                    (<any>internals).states[verb](`--${truthy}`);
                }
                if(falsy){
                    const verb = nv ? 'remove' : 'add';
                    (<any>internals).states[verb](`--${falsy}`);
                }
            })
        }
    }

    disconnect(){
        for(const ac of this.#abortController){
            ac.abort();
        }
    }
}