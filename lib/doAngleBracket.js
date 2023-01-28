export async function doAngleBracket(ctx, sup) {
    const { target, host, rhs } = ctx;
    const dp = new DOMParser();
    const doc = dp.parseFromString(rhs, 'text/html'); //switch to setHTML eventually, when no sanitizing, I guess
    const firstChild = doc.body.firstElementChild;
    const methodName = `<${firstChild.localName}/>`;
    const method = host[methodName];
    if (typeof method === 'function') {
        await method(ctx, doc);
    }
    else {
        sup(ctx);
    }
}
