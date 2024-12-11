export async function getVal(ctx, path, delay) {
    const { host } = ctx;
    if (host === undefined)
        return path;
    switch (path) {
        case '.':
        case '$0':
            return host;
    }
    if (path.startsWith('?.')) {
        const qSplit = path.split('??');
        let deflt = qSplit[1];
        const { splitExt } = await import('./splitExt.js');
        const dSplit = splitExt(qSplit[0].trim());
        const { getProp } = await import('./getProp.js');
        if (delay !== undefined)
            await sleep(delay);
        let val = await getProp(host, dSplit);
        if (val === undefined && deflt) {
            deflt = deflt.trim();
            if (deflt[0] === ".") {
                return await getVal(ctx, deflt);
            }
            else {
                return deflt;
            }
        }
        return val;
    }
    else {
        return host[path];
    }
}
function sleep(delay) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, delay);
    });
}
