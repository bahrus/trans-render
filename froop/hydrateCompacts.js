import { tryParse } from '../lib/prs/tryParse.js';
import { whenSrcKeyChanges } from './roundabout.js';
const srcToDest = String.raw `(?<srcKey>[\w]+)_to_(?<destKey>[\w]+)`;
const reCompacts = [
    // {
    //     regExp: new RegExp(String.raw `${whenSrcKeyChanges}invoke_(?<destKey>[\w\_])`),
    //     defaultVals:{
    //         op: 'invoke'
    //     }
    // },
    {
        regExp: new RegExp(String.raw `^negate_${srcToDest}`),
        defaultVals: {
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
        regExp: new RegExp(String.raw `^echo_${srcToDest}`),
        defaultVals: {
            op: 'echo'
        }
    },
    {
        regExp: new RegExp(String.raw `${whenSrcKeyChanges}toggle_(?<destKey>[\w\_])`),
        defaultVals: {
            op: 'toggle'
        }
    },
    {
        regExp: new RegExp(String.raw `${whenSrcKeyChanges}inc_(?<destKey>[\w\_])`),
        defaultVals: {
            op: 'inc'
        }
    }
];
export function hydrateCompacts(compacts, ra) {
    for (const key in compacts) {
        const test = tryParse(key, reCompacts);
        if (test === null)
            continue; // hopefully an invoke
        const cm = new CompactManager(test, compacts[key], ra);
    }
}
class CompactManager {
    #ac;
    #cc;
    #rhs;
    #ra;
    constructor(cc, rhs, ra) {
        this.#ac = new AbortController();
        this.#cc = cc;
        this.#rhs = rhs;
        this.#ra = ra;
        const { destKey, op, srcKey } = cc;
        const { options } = ra;
        const { vm } = options;
        const { propagator } = vm;
        propagator?.addEventListener(destKey, e => {
            this.#doAction(false);
        }, { signal: this.#ac.signal });
        this.#doAction(false);
        propagator?.addEventListener('disconnectedCallback', e => {
            this.#ac.abort();
        });
    }
    #doAction(afterDelay) {
        const { op } = this.#cc;
        const rhs = this.#rhs;
        if (!afterDelay && rhs > 0) {
            switch (op) {
                case 'echo':
                case 'invoke':
                case 'negate':
                case 'toggle':
                    setTimeout(() => {
                        this.#doAction(true);
                    }, rhs);
                    return;
            }
        }
        const { srcKey, destKey } = this.#cc;
        const vm = this.#ra.options.vm;
        const val = vm[srcKey];
        switch (op) {
            case 'echo':
                vm[destKey] = val;
                break;
            case 'inc':
                vm[destKey] += rhs;
                break;
            case 'invoke':
                // this is where we want to make use of covert assignment, busses if possible
                throw 'NI';
            case 'negate':
                vm[destKey] = !val;
                break;
            case 'pass_length':
                if (Array.isArray(val))
                    vm[destKey] = val.length;
                vm[destKey] = Array.isArray(val) ? val.length : rhs;
                break;
            case 'toggle':
                vm[destKey] = !vm[destKey];
                break;
        }
    }
}
