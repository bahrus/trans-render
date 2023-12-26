import { arr } from '../Transform.js';
export async function Engage(transformer, matchingElement, type, uow, mountContext, stage) {
    const { e } = uow;
    const methodArg = {
        mountContext,
        stage,
        type
    };
    const model = transformer.model;
    let transpiledEngagements = typeof e === 'string' ? [{
            do: e
        }] : arr(e).map(x => typeof x === 'string' ? { do: x } : x);
    for (const enhance of transpiledEngagements) {
        const { do: d, with: w, undo, forget, be } = enhance;
        let met;
        switch (type) {
            case 'onMount': {
                met = d;
                break;
            }
            case 'onDisconnect': {
                met = forget;
                break;
            }
            case 'onDismount': {
                met = undo;
            }
        }
        if (met !== undefined) {
            model[met](model, matchingElement, {
                ...methodArg,
                be,
                with: w
            });
        }
    }
}
