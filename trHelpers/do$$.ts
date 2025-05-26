import {Transformer, MountOrchestrator, arr0} from '../Transform.js';
import {Clone$Options, QuenitOfWork, ScopedLoop, ScopeInstructions} from '../ts-refs/trans-render/types.js';
import {Scope} from '../froop/Scope.js';



export async function do$$<TProps extends {}, TMethods = TProps, TElement = {}>(
    transformer: Transformer<TProps, TMethods, TElement>,
    matchingElement: Element,
    scopedLoop: ScopedLoop,
    uow: QuenitOfWork<TProps, TMethods, TElement>
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
        


        regIsh(target as Element, options.itemProp!, s);

    }
    
    const mergedOptions = {...defaultOptions, ...options};
    mergedOptions.seedEl = matchingElement;
    mergedOptions.itemTemplate = templ;
    const ishListContainer = matchingElement.closest('[itemscope]:not([itemscope=""])') as any;
    if(ishListContainer !== null){
        if(ishListContainer.ish === undefined){
            const {waitForIsh} = await import('mount-observer/waitForIsh.js');
            console.log('waiting for ish');
            await waitForIsh(ishListContainer);
        }
        mergedOptions.ish = ishListContainer.ish;
        mergedOptions.listProp = ishListContainer.getAttribute('itemprop');
        //mergedOptions.model = transformer.model;
        const {Clone$} = await import('./Clone$.js');
        const clone$ = new Clone$(mergedOptions as Clone$Options);
    }
    
}

const defaultOptions: Partial<Clone$Options> = {
    baseCrumb: 'trans-render-',
    idxStart: 0,
}