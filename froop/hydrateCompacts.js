import { tryParse } from '../lib/prs/tryParse.js';
import { whenSrcKeyChanges } from './roundabout.js';
const srcToDest = String.raw `(?<srcKey>[\w]+)_to_(?<destKey>[\w]+)`;
const reCompacts = [
    {
        regExp: new RegExp(String.raw `${whenSrcKeyChanges}invoke_(?<destKey>[\w\_]+)`),
        defaultVals: {
            op: 'invoke'
        }
    },
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
export async function hydrateCompacts(compacts, ra) {
    for (const key in compacts) {
        const test = await tryParse(key, reCompacts);
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
        const { srcKey } = cc;
        const { options } = ra;
        const { vm } = options;
        const { propagator } = vm;
        propagator?.addEventListener(srcKey, e => {
            this.#doAction(false, false);
        }, { signal: this.#ac.signal });
        this.#doAction(false, true);
        propagator?.addEventListener('disconnectedCallback', e => {
            this.#ac.abort();
        });
    }
    #doAction(afterDelay, initializing) {
        const { op, rhsIsDynamic } = this.#cc;
        const vm = this.#ra.options.vm;
        const rhs = rhsIsDynamic ? vm[this.#rhs] : this.#rhs;
        if (!afterDelay && rhs > 0) {
            switch (op) {
                case 'echo':
                case 'invoke':
                case 'negate':
                case 'toggle':
                    setTimeout(() => {
                        this.#doAction(true, initializing);
                    }, rhs);
                    return;
            }
        }
        const { srcKey, destKey } = this.#cc;
        const val = vm[srcKey];
        if (initializing && val === undefined)
            return;
        switch (op) {
            case 'echo':
                vm[destKey] = val;
                break;
            case 'inc':
                vm[destKey] += rhs;
                break;
            case 'invoke':
                this.#ra.doKey(destKey, vm, new Set());
                break;
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
