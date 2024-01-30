import { Transform } from '../Transform.js';
export async function doNestedTransforms(matchingElement, attrMap, subModel, uows, mo) {
    const { queryInfo, transformer } = mo;
    const prop = attrMap.name;
    const { options } = transformer;
    const { propagator } = options;
    propagator.___nestedProps = (propagator.___nestedProps || new Map()).set(prop, subModel);
    for (const uow of uows) {
        const newUOW = { ...uow };
        delete newUOW.q;
        const transform = await Transform(matchingElement, subModel, newUOW);
        propagator.___nestedProps.set(prop, transform);
    }
}
