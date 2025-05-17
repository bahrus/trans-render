import { MountObserver } from 'mount-observer/MountObserver.js';
import { IMountObserver, MountContext } from '../ts-refs/mount-observer/types.js';
import {Transformer, MountOrchestrator, arr0} from '../Transform.js';
import {QuenitOfWork, ScopeInstructions} from '../ts-refs/trans-render/types.js';
import {Scope} from '../froop/Scope.js';
//import { tagTempl } from '../dss/tref/tagTempl.js';

//import {waitForIsh} from 'mount-observer/waitForIsh.js';

export async function do$<TProps, TMethods>(
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
        regIsh(target as Element, name, s);
    }

    // const {model} = transformer;
    // const prop = uow.o[0];
    // const ish = await waitForIsh(matchingElement);
    // model[prop] = ish;
    // console.log({model, prop, ish});
}