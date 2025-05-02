import { splitRefs } from 'mount-observer/refid/splitRefs.js';
export function tail(el) {
    const itemref = el.getAttribute('itemref');
    if (itemref) {
        const refs = splitRefs(itemref);
        let ns = el.nextElementSibling;
        if (ns === null)
            return el;
        let lastNS = ns;
        while (ns) {
            if (!refs.includes(ns.id)) {
                return lastNS;
            }
            lastNS = ns;
            ns = ns.nextElementSibling;
        }
        return lastNS;
    }
}
