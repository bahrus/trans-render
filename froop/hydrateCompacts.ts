import {tryParse, RegExpOrRegExpExt} from '../lib/prs/tryParse.js';
import { RoundAbout, whenSrcKeyChanges } from './roundabout.js';
import { Compacts, RoundaboutReady, CompactStatement } from '../ts-refs/trans-render/froop/types.js';
import {EventRouter} from '../EventRouter.js';
const srcToDest = String.raw `(?<srcKey>[\w]+)_to_(?<destKey>[\w]+)`;



const reCompacts: Array<RegExpOrRegExpExt<CompactStatement>> = [
    {
        regExp: new RegExp(String.raw `${whenSrcKeyChanges}invoke_(?<destKey>[\w\_]+)`),
        defaultVals:{
            op: 'invoke'
        }
    },
    {
        regExp: new RegExp(String.raw `^negate_${srcToDest}`),
        defaultVals:{
            op: 'negate'
        }
    },
    {
        regExp: new RegExp(String.raw `^pass_length_of_${srcToDest}`),
        defaultVals: {
            op: 'pass_length'
        }
    },
    {
        regExp: new RegExp(String.raw `^echo_${srcToDest}_after`),
        defaultVals: {
            op: 'echo',
            rhsIsDynamic: true,
        }
    },
    {
        regExp: new RegExp(String.raw `^echo_${srcToDest}`),
        defaultVals: {
            op: 'echo'
        }
    },
    {
        regExp: new RegExp(String.raw `${whenSrcKeyChanges}toggle_(?<destKey>[\w\_])`),
        defaultVals:{
            op: 'toggle'
        }
    },
    {
        regExp: new RegExp(String.raw `${whenSrcKeyChanges}inc_(?<destKey>[\w\_])`),
        defaultVals:{
            op: 'inc'
        }
    }
];

export async function hydrateCompacts(compacts: Compacts, ra: RoundAbout){
    for(const key in compacts){
        const test = await tryParse(key, reCompacts) as CompactStatement;
        if(test === null) continue; // hopefully an invoke
        const cm = new CompactManager(test, (<any>compacts)[key] as number, ra);
    }
}

class CompactManager{
    #ac: AbortController;
    #cc: CompactStatement;
    #rhs: number;
    #ra: RoundAbout;
    constructor(cc: CompactStatement, rhs: number, ra: RoundAbout){
        this.#ac = new AbortController();
        this.#cc = cc;
        this.#rhs = rhs;
        this.#ra = ra;
        const {srcKey} = cc;
        const {options} = ra;
        const {vm} = options;
        const {propagator} = (vm as RoundaboutReady);
        propagator?.addEventListener(srcKey, this, {signal: this.#ac.signal});
        this.#doAction(false, true);
        propagator?.addEventListener('disconnectedCallback', this, {once: true});
    }

    handleEvent(e: Event){
        switch(e.type){
            case 'disconnectedCallback':
                this.#ac.abort();
                break;
            default:
                this.#doAction(false, false);
        }
        
    }

    #doAction(afterDelay: boolean = false, initializing: boolean = false){
        const {op, rhsIsDynamic} = this.#cc;
        const vm = this.#ra.options.vm;
        const rhs = rhsIsDynamic ? vm[this.#rhs] : this.#rhs;
        
        if(!afterDelay && rhs > 0){
            switch(op){
                case 'echo':
                
                //case 'invoke': taken care of from actions
                case 'negate':
                case 'toggle':
                    setTimeout(() => {
                        this.#doAction(true, initializing);
                    }, rhs);
                    return;
            }
        }
        const {srcKey, destKey} = this.#cc;
        const val = vm[srcKey];
        if(initializing && val === undefined) return;
        switch(op){
            case 'echo':
                vm[destKey] = val;
                break;
            case 'inc':
                vm[destKey] += rhs;
                break;
            case 'invoke':
                //taken care of from actions
                //this.#ra.doKey(destKey, vm, new Set());
                break;
            case 'negate':
                vm[destKey] = !val;
                break;
            case 'pass_length':
                if(Array.isArray(val)) vm[destKey] = val.length;
                vm[destKey] = Array.isArray(val) ? val.length : rhs;
                break;
            case 'toggle':
                vm[destKey] = !vm[destKey];
                break;
        }
    }
}

