import { getHostish } from './getHostish.js';
export async function findR(element, specifier, scopeE) {
    const { scopeS, elS, isModulo, is$cope } = specifier;
    if (scopeS !== undefined) {
        const { dss, rec, rnf, host, s, prop, isiss, scopeS } = specifier;
        switch (dss) {
            case '^':
                let closest;
                const seed = (scopeE || element);
                if (isiss) {
                    const prev = seed.previousElementSibling || seed.parentElement;
                    if (prev === null)
                        throw 404;
                    const { upSearch } = await import('../lib/upSearch.js');
                    const css = elS === undefined ? `${scopeS}` : `${scopeS}:has(${elS})`;
                    closest = upSearch(prev, css);
                }
                else {
                    const { parentElement } = seed;
                    closest = parentElement?.closest(scopeS);
                }
                if (s === '~' && elS !== undefined) {
                    const peerCE = (closest || element.getRootNode()).querySelector(elS);
                    if (peerCE) {
                        if (elS.includes('-')) {
                            await customElements.whenDefined(elS);
                        }
                        return peerCE;
                    }
                }
                if (host && closest) {
                    const hostish = await getHostish(closest);
                    if (hostish)
                        return hostish;
                }
                if (elS === undefined)
                    return closest;
                if (rnf) {
                    const rn = element.getRootNode();
                    if (host && rn instanceof ShadowRoot) {
                        const h = rn.host;
                        const { localName } = h;
                        if (localName.includes('-')) {
                            await customElements.whenDefined(localName);
                            return h;
                        }
                    }
                    return rn?.querySelector(elS);
                }
                const found = closest?.querySelector(elS);
                if (found) {
                    return found;
                }
                if (rec && closest)
                    return await findR(element, specifier, closest);
                return null;
            case '?':
                throw 'NI';
            case 'Y':
                {
                    let ns = element.nextElementSibling;
                    if (scopeS === undefined)
                        throw 'NI';
                    while (ns) {
                        if (ns.matches(scopeS)) {
                            if (elS !== undefined) {
                                return ns.querySelector(elS);
                            }
                            return ns;
                        }
                        ns = ns.nextElementSibling;
                    }
                }
                throw 404;
        }
    }
    else if (isModulo) {
        const { modulo: m, elS } = specifier;
        const { modulo } = await import('./modulo.js');
        const within = modulo(element, m);
        if (elS !== undefined)
            throw 'NI'; //not implemented
        return within;
        //within
    }
    else if (is$cope) {
        const { $copeDetail } = specifier;
        throw 'NI';
    }
}
