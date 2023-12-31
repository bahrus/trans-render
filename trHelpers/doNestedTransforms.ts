import {QuenitOfWork, XForm} from '../types';
import {MountOrchestrator, Transform} from '../Transform.js';
export async function doNestedTransforms(matchingElement: Element, uows: Array<QuenitOfWork<any, any>>, mo: MountOrchestrator<any, any>){
    const {queryInfo, transformer} = mo;
    const {prop} = queryInfo;
    const {model, options} = transformer;
    const {propagator} = options;
    const subModel = model[prop!];
    propagator!.___nestedProps = (propagator!.___nestedProps || new Map<string, any>()).set(prop!, subModel);
    for(const uow of uows){
        const newUOW = {...uow};
        delete (<any>newUOW).q;
        const transform = await Transform(matchingElement, subModel, newUOW as XForm<any, any>);
        propagator!.___nestedProps.set(prop!, transform);
    }
}