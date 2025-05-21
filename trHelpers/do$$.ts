import {Transformer, MountOrchestrator, arr0} from '../Transform.js';
import {QuenitOfWork, ScopeInstructions} from '../ts-refs/trans-render/types.js';
import {Scope} from '../froop/Scope.js';

export async function do$$<TProps extends {}, TMethods = TProps>(
    transformer: Transformer<TProps, TMethods>,
    matchingElement: Element,
    scopingInstructions: ScopeInstructions,
    uow: QuenitOfWork<TProps, TMethods>
){
    let templ: HTMLTemplateElement;
    if(!(matchingElement instanceof HTMLTemplateElement)){
        const {templify} = await import('./templify.js');
        templ = templify(matchingElement);
    }else{
        templ = matchingElement;
    }
    
}