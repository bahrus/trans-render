export async function doUpdate(transformer, matchingElement, uow) {
    const { d } = uow;
    switch (typeof d) {
        case 'number': {
            const val = transformer.getNumberUVal(uow, d);
            transformer.setPrimeValue(matchingElement, val);
            break;
        }
        case 'function': {
            const newU = await d(matchingElement, uow);
            const newUow = {
                ...uow,
                d: newU,
            };
            if (newU !== undefined) {
                await transformer.doUpdate(matchingElement, uow, newU);
            }
            break;
        }
        case 'object': {
            if (Array.isArray(d)) {
                const val = transformer.getArrayVal(uow, d);
                transformer.setPrimeValue(matchingElement, val);
            }
            else {
                const val = await transformer.getNestedObjVal(uow, d);
                Object.assign(matchingElement, val);
            }
        }
    }
}
