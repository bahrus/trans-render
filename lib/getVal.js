export async function getVal(host, path) {
    if (host === undefined)
        return path;
    switch (path[0]) {
        case '.': {
            if (path === '.')
                return host;
            //path = path.substr(1);
            const qSplit = path.split('??');
            let deflt = qSplit[1];
            const { splitExt } = await import('trans-render/lib/splitExt.js');
            const dSplit = splitExt(qSplit[0].trim());
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
        // case '?':{
        //     path = path.substr(1);
        //     const qSplit = path.split(' ');
        //     const condition = await getVal(host, qSplit[0]) as boolean;
        //     const cSplit = qSplit.slice(1).join('').split(':');
        //     const idx = condition ? 0 : 1;
        //     const val = cSplit[idx];
        //     if (val[0] === ".") {
        //         return await getVal(host, val);
        //     }else{
        //         return val;
        //     }
        // }
        default:
            return host[path];
    }
}
