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
                const { do: d, with: w, undo, forget } = enhance;
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
                        with: w
                    });
                }
            }
            break;
    }
}
