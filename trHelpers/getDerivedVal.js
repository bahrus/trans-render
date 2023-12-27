export async function getDerivedVal(transformer, uow, d) {
    switch (typeof d) {
        case 'number': {
            return await transformer.getNumberUVal(uow, d);
        }
        case 'function': {
            const { model } = transformer;
            return await d(model);
        }
        case 'object': {
            if (Array.isArray(d)) {
                return transformer.getArrayVal(uow, d);
            }
            else {
                throw 'NI';
                // const val = await transformer.getNestedObjVal(uow, d);
                // Object.assign(matchingElement, val);
            }
            break;
        }
        case 'string': {
            const { model } = transformer;
            return model[d](model);
        }
    }
}
