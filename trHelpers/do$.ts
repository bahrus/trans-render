// import { MountObserver } from 'mount-observer/MountObserver.js';
// import { IMountObserver, MountContext } from '../ts-refs/mount-observer/types.js';
import {Transformer, MountOrchestrator, arr0} from '../Transform.js';
import {QuenitOfWork, ScopeInstructions} from '../ts-refs/trans-render/types.js';
import {Scope} from '../froop/Scope.js';
//import { tagTempl } from '../dss/tref/tagTempl.js';

//import {waitForIsh} from 'mount-observer/waitForIsh.js';

export async function do$<TProps extends {}, TMethods = TProps>(
    transformer: Transformer<TProps, TMethods>,
    matchingElement: Element,
    scopingInstructions: ScopeInstructions,
    uow: QuenitOfWork<TProps, TMethods>
){
    console.log('starting do$');
    const {name, config} = scopingInstructions;
    

    if(config !== null){
        class s extends Scope {
            static config = config;
        }
        s.bootUp();
        const {regIsh} = await import('mount-observer/refid/regIsh.js');
        const {target} = transformer;
        regIsh(target as Element, name, s);
        const {Newish} = await import('mount-observer/Newish.js');
        const {assignGingerly} = await import('../lib/assignGingerly.js');
                const {model} = transformer as {model: any};
        const {o} = uow as {o: string[]}; //TODO, less of a hack
        const prop = o[0];
        const val = model[prop];
        const n = new Newish(matchingElement, matchingElement, name, {
            ctr: s,
            assigner: assignGingerly,
            csr: true,
            initPropVals: val,
        });
        await n.do();
        matchingElement.setAttribute('itemscope', name);
        console.log('done with do$');
        // if(typeof(model[prop]) !== 'function'){
        //     const vm = new s();
            
        //     if(Array.isArray(val)){
        //         (<any>vm)[sym] = val;
        //     }else{
        //         Object.assign(vm, val);
        //     }
            
        //     model[prop] = vm;
        //     (<any>matchingElement).ish = vm;
        // }else{
        //     if(Array.isArray(val)){
        //         throw 'NI';
        //         (<any>matchingElement).ishList = val;
        //     }else{
        //         Object.assign(<any>matchingElement, val);
        //     }
        // }

        

    }


}