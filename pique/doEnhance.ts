import { MountContext, PipelineStage } from 'mount-observer/types';
import {PiqueProcessor, Transformer, arr} from '../index.js';
import {onMountStatusChange, MethodInvocationCallback} from '../types';

export async  function doEnhance<TProps, TActions=TProps>(
    transformer: Transformer<TProps, TActions>, 
    matchingElement: Element, 
    type: onMountStatusChange, 
    piqueProcessor: PiqueProcessor<TProps>, mountContext: MountContext, stage: PipelineStage | undefined){
    const {pique} = piqueProcessor;
    const {e} = pique;
    if(e === undefined) return;
    const methodArg: MethodInvocationCallback<TActions> = {
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