import { arr0 } from '../Transform.js';
import { assignGingerly } from '../lib/assignGingerly.js';
export async function Engage(transformer, matchingElement, type, uow, mountContext) {
    const { e } = uow;
    const methodArg = {
        mountContext,
        type
    };
    const model = transformer.model;
    let transpiledEngagements = typeof e === 'string' ? [{
            do: e
        }] : arr0(e).map(x => typeof x === 'string' ? { do: x } : x);
    for (const engagement of transpiledEngagements) {
        if ('enhPropKey' in engagement) {
            throw 'NI';
        }
        else {
            const { do: d, with: w, undo, forget, be, dep, waitForResolved } = engagement;
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
                    //be,
                    with: w
                });
            }
            if (type === 'onMount') {
                if (dep !== undefined)
                    dep();
                if (be !== undefined) {
                    //const prop = 'be' + be[0].toUpperCase() + be.substring(1);
                    //const {camelToLisp} = await import('../lib/camelToLisp.js');
                    //const localName = 'be-' + camelToLisp(be);
                    await customElements.whenDefined('be-enhanced');
                    const beEnhanced = matchingElement.beEnhanced;
                    // if(w !== undefined){
                    //     Object.assign(obj, w);
                    // }
                    let obj;
                    if (waitForResolved) {
                        obj = await matchingElement.beEnhanced.whenResolved(be);
                    }
                    else {
                        obj = matchingElement.beEnhanced.whenAttached(be);
                    }
                    assignGingerly(obj, w);
                }
            }
        }
    }
}
