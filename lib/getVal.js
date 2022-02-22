export async function getVal(host, path) {
    if (host === undefined)
        return path;
    switch (path[0]) {
        case '.': {
            path = path.substr(1);
            const qSplit = path.split('??');
            let deflt = qSplit[1];
            const dSplit = qSplit[0].trim().split('.');
            const { getProp } = await import('./getProp.js');
            let val = getProp(host, dSplit);
            if (val === undefined && deflt) {
                deflt = deflt.trim();
                if (deflt[0] === ".") {
                    return await getVal(host, deflt);
                }
                else {
                    return deflt;
                }
            }
            return val;
        }
        case '?': {
            path = path.substr(1);
            const qSplit = path.split(' ');
            const condition = await getVal(host, qSplit[0]);
            const cSplit = qSplit[1].split(':');
            const idx = condition ? 0 : 1;
            return await getVal(host, cSplit[idx].trim());
        }
        default:
            return host[path];
    }
}
