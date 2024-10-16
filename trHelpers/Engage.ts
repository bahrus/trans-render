import { IMountObserver, MountContext, PipelineStage } from '../ts-refs/mount-observer/types';
import { MountOrchestrator, Transformer, arr0 } from '../Transform.js';
import { onMountStatusChange, EngagementCtx, UnitOfWork, Engagement, EngagementOrEMC } from '../ts-refs/trans-render/types.js'; 
import { assignGingerly } from '../lib/assignGingerly.js';

export async function Engage<TProps extends {}, TMethods = TProps, TElement = {}>(
    transformer: Transformer<TProps, TMethods, TElement>,
    matchingElement: Element,
    type: onMountStatusChange,
    uow: UnitOfWork<TProps, TMethods, TElement>, mountContext: MountContext) {
    const { e } = uow;
    const methodArg: EngagementCtx<TMethods> = {
        mountContext,
        type
    };
    const model = transformer.model as any;
    let transpiledEngagements: Array<EngagementOrEMC<TMethods, any>> =
        typeof e === 'string' ? [{
            do: e
        }] : arr0(e!).map(x => typeof x === 'string' ? {do: x} : x);
    for (const engagement of transpiledEngagements) {
        if('enhPropKey' in engagement){
            throw 'NI';
        }else{
            const { do: d, with: w, undo, forget, be, dep, waitForResolved } = engagement;
            let met: (keyof TMethods & string) | undefined;
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
            if(type === 'onMount'){
                if(dep !== undefined) dep();
                if(be !== undefined){
                    //const prop = 'be' + be[0].toUpperCase() + be.substring(1);
                    //const {camelToLisp} = await import('../lib/camelToLisp.js');
                    //const localName = 'be-' + camelToLisp(be);
                    await customElements.whenDefined('be-enhanced');
                    const beEnhanced = (<any>matchingElement).beEnhanced;
                    // if(w !== undefined){
                    //     Object.assign(obj, w);
                    // }
                    let obj: any;
                    if(waitForResolved){
                        obj = await (<any>matchingElement).beEnhanced.whenResolved(be);
                    }else{
                        obj = (<any>matchingElement).beEnhanced.whenAttached(be);
                    }
                    assignGingerly(obj, w);
                                    
                }
                
    
            }
        }


    }


}