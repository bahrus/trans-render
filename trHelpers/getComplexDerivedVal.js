export async function getComplexDerivedVal(transformer, uow, dc) {
    const { from, path, as } = dc;
    const idx = from || 0;
    let val = transformer.getNumberUVal(uow, idx);
    if (path !== undefined) {
        const { getVal } = await import('../lib/getVal.js');
        val = await getVal({ host: val }, path);
    }
    if (as !== undefined) {
        const { convert } = await import('../lib/convert.js');
        val = convert(val, as);
    }
    return val;
}
