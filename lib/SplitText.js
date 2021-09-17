import { getProp } from './getProp.js';
export class SplitText {
    do({ host, target, rhs, key, ctx }) {
        const toProp = this.getToProp(key) || 'textContent';
        if (rhs === '.') {
            target[toProp] = host;
            return;
        }
        if (typeof rhs === 'string') {
            target[toProp] = this.getVal(host, rhs);
            return;
        }
        target[toProp] = this.interpolate(rhs, host);
    }
    getToProp(key) {
        if (!key?.endsWith(']'))
            return;
        const iPos = key?.lastIndexOf('[');
        if (iPos === -1)
            return;
        key = key.replace('[data-data-', '[-');
        if (key[iPos + 1] !== '-')
            return;
        key = key.substring(iPos + 2, key.length - 1);
        return key;
    }
    getVal(host, path) {
        if (host === undefined)
            return path;
        if (path[0] !== '.')
            return host[path];
        path = path.substr(1);
        const qSplit = path.split('??');
        let deflt = qSplit[1];
        const dSplit = qSplit[0].trim().split('.');
        let val = getProp(host, dSplit);
        if (val === undefined && deflt) {
            deflt = deflt.trim();
            if (deflt[0] === ".") {
                return this.getVal(host, deflt);
            }
            else {
                return deflt;
            }
        }
        return val;
    }
    interpolate(textNodes, host) {
        return textNodes.map((path, idx) => {
            if (idx % 2 === 0)
                return path;
            return this.getVal(host, path);
        }).join('');
    }
}
