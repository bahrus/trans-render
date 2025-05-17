import { MountObserver } from 'mount-observer/MountObserver.js';
import { IMountObserver, MountContext } from '../ts-refs/mount-observer/types.js';
import {Transformer, MountOrchestrator, arr0} from '../Transform.js';
import {QuenitOfWork, ScopeInstructions} from '../ts-refs/trans-render/types.js';
import {Scope} from '../froop/Scope.js';
import { match } from '../lib/specialKeys.js';
//import { tagTempl } from '../dss/tref/tagTempl.js';

//import {waitForIsh} from 'mount-observer/waitForIsh.js';

export async function do$<TProps extends {}, TMethods = TProps>(
    transformer: Transformer<TProps, TMethods>,
    matchingElement: Element,
    scopingInstructions: ScopeInstructions,
    uow: QuenitOfWork<TProps, TMethods>
){
    const {name, config} = scopingInstructions;
    matchingElement.setAttribute('itemscope', name);

    if(config !== null){
        class s extends Scope {
            static config = config;
        }
        s.bootUp();
        const {regIsh} = await import('mount-observer/refid/regIsh.js');
        const {target} = transformer;
        
        const {model} = transformer as {model: any};
        const {o} = uow as {o: string[]}; //TODO, less of a hack
        const prop = o[0];
        if(typeof(model[prop]) !== 'function'){
            const vm = new s();
            Object.assign(vm, model[prop]);
            model[prop] = vm;
            (<any>matchingElement).ish = vm;
        }else{
            (<any>matchingElement).ish = model[prop];
        }

        regIsh(target as Element, name, s);

    }


}