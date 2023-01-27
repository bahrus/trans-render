export async function doAngleBracket(ctx, sup) {
    const { target, host, rhs } = ctx;
    const method = host[rhs];
    if (typeof method === 'function') {
        await method(ctx);
    }
    else {
        sup(ctx);
    }
}
