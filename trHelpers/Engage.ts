import { IMountObserver, MountContext, PipelineStage } from 'mount-observer/types';
import { MountOrchestrator, Transformer, arr } from '../Transform.js';
import { onMountStatusChange, EngagementCtx, UnitOfWork, Engagement, EngagementOrEMC } from '../types.js';

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
        }] : arr(e!).map(x => typeof x === 'string' ? {do: x} : x);
    for (const engagement of transpiledEngagements) {
        if('enhPropKey' in engagement){

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
                    const prop = 'be' + be[0].toUpperCase() + be.substring(1);
                    const {camelToLisp} = await import('../lib/camelToLisp.js');
                    const localName = 'be-' + camelToLisp(be);
                    await customElements.whenDefined('be-enhanced');
                    const obj = (<any>matchingElement).beEnhanced.by[prop];
                    if(w !== undefined){
                        Object.assign(obj, w);
                    }
                    if(waitForResolved){
                        await (<any>matchingElement).beEnhanced.whenResolved(localName);
                    }else{
                        (<any>matchingElement).beEnhanced.whenAttached(localName);
                    }
                                    
                }
                
    
            }
        }


    }


}