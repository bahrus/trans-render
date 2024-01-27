import { Transform } from '../Transform.js';
export async function doNestedTransforms(matchingElement, uows, mo) {
    const { queryInfo, transformer } = mo;
    const { hostPropToAttrMap } = queryInfo;
    if (hostPropToAttrMap.length !== 1)
        throw 'NI';
    const prop = hostPropToAttrMap[0].name;
    const { model, options } = transformer;
    const { propagator } = options;
    const subModel = model[prop];
    propagator.___nestedProps = (propagator.___nestedProps || new Map()).set(prop, subModel);
    for (const uow of uows) {
        const newUOW = { ...uow };
        delete newUOW.q;
        const transform = await Transform(matchingElement, subModel, newUOW);
        propagator.___nestedProps.set(prop, transform);
    }
}
