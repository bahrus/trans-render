import { arr } from '../index.js';
export async function doEnhance(transformer, matchingElement, type, piqueProcessor, mountContext, stage) {
    const { pique } = piqueProcessor;
    const { e } = pique;
    if (e === undefined)
        return;
    const methodArg = {
        mountContext,
        stage,
        type
    };
    const model = transformer.model;
    switch (typeof e) {
        case 'string': {
            model[e](model, matchingElement, methodArg);
            break;
        }
        case 'object':
            const es = arr(e);
            for (const enhance of es) {
                const { do: d, with: w } = enhance;
                model[d](model, matchingElement, {
                    ...methodArg,
                    with: w
                });
            }
            break;
    }
}
