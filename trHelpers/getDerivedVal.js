export async function getDerivedVal(transformer, uow, d, matchingElement) {
    switch (typeof d) {
        case 'number': {
            return await transformer.getNumberUVal(uow, d);
        }
        case 'function': {
            const { model } = transformer;
            return await d(model, transformer, uow, matchingElement);
        }
        case 'object': {
            if (Array.isArray(d)) {
                return await transformer.getArrayVal(uow, d);
            }
            else {
                return await transformer.getComplexDerivedVal(uow, d);
            }
        }
        case 'string': {
            const { model } = transformer;
            return model[d](model, transformer, uow, matchingElement);
        }
    }
}
