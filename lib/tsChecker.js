export class TSChecker {
    key;
    #lastTimestampHostLookup = new WeakMap();
    #lastFragmentTimestampLookup = new WeakMap();
    constructor(key) {
        this.key = key;
    }
    notChanged(host, fragment) {
        const val = host[this.key];
        if (val === undefined) {
            console.warn('no timestamp found');
            return false;
        }
        if (this.#lastTimestampHostLookup.get(host) === val && this.#lastFragmentTimestampLookup.get(fragment) === val)
            return true;
        this.#lastTimestampHostLookup.set(host, val);
        this.#lastFragmentTimestampLookup.set(fragment, val);
        return false;
    }
}
