import { MountContext, PipelineStage } from 'mount-observer/types';
import {MountOrchestrator, Transformer, arr} from '../Transform.js';
import {onMountStatusChange, MethodInvocationCallback as EnhanceContext, UnitOfWork} from '../types.js';

export async  function doEnhance<TProps, TMethods=TProps>(
    transformer: Transformer<TProps, TMethods>, 
    matchingElement: Element, 
    type: onMountStatusChange, 
    uow: UnitOfWork<TProps, TMethods>, mountContext: MountContext, stage: PipelineStage | undefined){
    const {e} = uow;
    const methodArg: EnhanceContext<TMethods> = {
        mountContext,
        stage,
        type
    };
    const model = transformer.model as any;
    switch(typeof e){
        case 'string':{
            model[e](model, matchingElement, methodArg);
            break;
        }
        case 'object':
            const es = arr(e);
            for(const enhance of es){
                const {do: d, with: w} = enhance;
                model[d](model, matchingElement, {
                    ...methodArg,
                    with: w
                });
            }
            break;
    }

}