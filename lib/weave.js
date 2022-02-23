export async function weave(textNodes, host) {
    return (await textNodes.map(async (path, idx) => {
        if (idx % 2 === 0)
            return path;
        const { getVal } = await import('./getVal.js');
        return await getVal(host, path);
    })).join('');
}
