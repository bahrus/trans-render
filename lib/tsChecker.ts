import {ITSChecker} from './types';
export class TSChecker implements ITSChecker{
    #lastTimestampHostLookup = new WeakMap<Element, number | string>();
    #lastFragmentTimestampLookup = new WeakMap<Element | DocumentFragment, number | string>();
    constructor(public key: string){}
    notChanged(host: Element, fragment: Element | DocumentFragment): boolean{
        const val = (host as any)[this.key] as string | number;
        if(val === undefined){
            console.warn('no timestamp found');
            return false;
        }
        if(this.#lastTimestampHostLookup.get(host) === val && this.#lastFragmentTimestampLookup.get(fragment) === val) return true;
        this.#lastTimestampHostLookup.set(host, val);
        this.#lastFragmentTimestampLookup.set(fragment, val);
        return false;
    }
}