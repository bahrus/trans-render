import { arr } from '../Transform.js';
export async function Engage(transformer, matchingElement, type, uow, mountContext, stage) {
    const { e } = uow;
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
