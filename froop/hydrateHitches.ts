import {tryParse, RegExpOrRegExpExt} from '../lib/prs/tryParse.js';
import { RoundAbout, whenSrcKeyChanges } from './roundabout.js';
import { Compacts, RoundaboutReady, HitchStatement, Hitches } from '../ts-refs/trans-render/froop/types.js';

const reHitches: Array<RegExpOrRegExpExt<HitchStatement>> = [
    {
        regExp: new RegExp(String.raw `^(?<lOp>when)_(?<leftKey>[\w]+)_(?<lmOp>emits)_(?<middleKey>[\w]+)_(?<mrOp>inc)_(?<rightKey>[\w]+)_(?<rOp>by)`),
        defaultVals: {}
    }
];

export async function hydrateHitches(hitches: Hitches, ra: RoundAbout){
    for(const key in hitches){
        const test = await tryParse(key, reHitches) as HitchStatement;
        if(test === null) throw 400;
        const hm = new HitchManager(test, (<any>hitches)[key] as number, ra); 
    }
}

class HitchManager{
    #ac: AbortController | undefined;
    #hs: HitchStatement;
    #rhs: number;
    #ra: RoundAbout;
    constructor(hs: HitchStatement, rhs: number, ra: RoundAbout){
        this.#hs = hs;
        this.#rhs = rhs;
        this.#ra = ra;
        const {options} = ra;
        const {vm} = options!;
        const {propagator} = vm!;
        const {middleKey, leftKey} = hs;
        propagator.addEventListener(middleKey, (e: Event) => {
            this.#hydrate();
        });
        propagator.addEventListener(leftKey, (e: Event) => {
            this.#hydrate();
        });
        propagator.addEventListener('disconnectedCallback', (e: Event) => {
            if(this.#ac !== undefined) this.#ac.abort();
        });
        this.#hydrate();
    }
    #hydrate(){
        const {options} = this.#ra;
        const {vm} = options;
        const {leftKey, middleKey, rightKey, mrOp} = this.#hs;
        const eventTarget = vm[leftKey] as EventTarget;
        if(eventTarget === undefined) return;
        const eventProp = vm[middleKey];
        if(eventProp === undefined) return;
        if(this.#ac !== undefined){
            this.#ac.abort();
        }
        this.#ac = new AbortController();
        eventTarget.addEventListener(eventProp, e => {
            switch(mrOp){
                case 'inc':
                    vm[rightKey] += this.#rhs;
                    break;
            }
        }, {signal: this.#ac.signal});

    }
    
}