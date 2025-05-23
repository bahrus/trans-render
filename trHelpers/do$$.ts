import {Transformer, MountOrchestrator, arr0} from '../Transform.js';
import {Clone$Options, QuenitOfWork, ScopedLoop, ScopeInstructions} from '../ts-refs/trans-render/types.js';
import {Scope} from '../froop/Scope.js';

export async function do$$<TProps extends {}, TMethods = TProps>(
    transformer: Transformer<TProps, TMethods>,
    matchingElement: Element,
    scopedLoop: ScopedLoop,
    uow: QuenitOfWork<TProps, TMethods>
){
    let templ: HTMLTemplateElement;
    if(!(matchingElement instanceof HTMLTemplateElement)){
        const {templify} = await import('./templify.js');
        templ = templify(matchingElement);
    }else{
        templ = matchingElement;
    }
    const {config, options} = scopedLoop;
    if(config !== null){
        //TODO:  consolidate
        class s extends Scope {
            static config = config;
        }
        s.bootUp();
        const {regIsh} = await import('mount-observer/refid/regIsh.js');
        const {target} = transformer;
        
        // const {model} = transformer as {model: any};
        // const {o} = uow as {o: string[]}; //TODO, less of a hack
        // const prop = o[0];
        // const val = model[prop];
        // if(typeof(model[prop]) !== 'function'){
        //     const vm = new s();
            
        //     if(Array.isArray(val)){
        //         (<any>vm).ishList = val;
        //     }else{
        //         Object.assign(vm, val);
        //     }
            
        //     model[prop] = vm;
        //     (<any>matchingElement).ish = vm;
        // }else{
        //     if(Array.isArray(val)){
        //         (<any>matchingElement).ishList = val;
        //     }else{
        //         Object.assign(<any>matchingElement, val);
        //     }
        // }

        regIsh(target as Element, options.itemProp, s);

    }
    const {Clone$} = await import('./Clone$.js');
    const mergedOptions = {...defaultOptions, ...options};
    mergedOptions.seedEl = matchingElement;
    mergedOptions.itemTemplate = templ;
    const ishListContainer = matchingElement.closest('[itemscope]:not([itemscope=""])');
    if(ishListContainer !== null){
        mergedOptions.ish = ishListContainer.ish;
    }
    const clone$ = new Clone$(mergedOptions as Clone$Options);
}

const defaultOptions: Partial<Clone$Options> = {
    baseCrumb: 'trans-render-',
    idxStart: 0,
}