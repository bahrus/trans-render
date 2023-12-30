import {QuenitOfWork, XForm} from '../types';
import {MountOrchestrator, Transform} from '../Transform.js';
export async function doNestedTransforms(matchingElement: Element, uows: Array<QuenitOfWork<any, any>>, mo: MountOrchestrator<any, any>){
    const {queryInfo, transformer} = mo;
    const {prop} = queryInfo;
    const {model} = transformer;
    const subModel = model[prop!];
    for(const uow of uows){
        const newUOW = {...uow};
        delete (<any>newUOW).q;
        await Transform(matchingElement, subModel, newUOW as XForm<any, any>);
    }
}