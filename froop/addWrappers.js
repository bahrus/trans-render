import { Wrapper } from '../XV/Wrapper.js';
const wrapperKey = Symbol();
export async function addWrappers(ctr, wrappers) {
    const proto = ctr.prototype;
    for (const key in wrappers) {
        if (key in proto)
            continue;
        const wrapper = wrappers[key];
        Object.defineProperty(proto, key, {
            get() {
                if (this[wrapperKey] === undefined) {
                    this[wrapperKey] = {};
                }
                const wrappers = this[wrapperKey];
                if (wrappers[key] === undefined) {
                    wrappers[key] = new Wrapper(this, wrapper);
                }
                return wrappers[key];
            }
        });
    }
}
