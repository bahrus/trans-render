import { MountObserver } from '../../mount-observer/MountObserver.js';
import { IMountObserver, MountContext } from '../ts-refs/mount-observer/types.js';
import {Transformer, MountOrchestrator, arr0} from '../Transform.js';
import {QuenitOfWork, AddEventListener, ForEachInterface} from '../ts-refs/trans-render/types.js'; 


export async function onMount<TProps extends {}, TMethods = TProps, TElement = {}>(
    transformer: Transformer<TProps, TMethods, TElement>,
    mo: MountOrchestrator<TProps, TMethods, TElement>, matchingElement: Element, uows: Array<QuenitOfWork<TProps, TMethods, TElement>>,
    skipInit: boolean, ctx: MountContext,matchingElements: WeakRef<Element>[],  observer?: IMountObserver, mountObserver?: MountObserver
    ){
    const {queryInfo} = mo;
    const {hostPropToAttrMap} = queryInfo;
    if(hostPropToAttrMap !== undefined && hostPropToAttrMap.length === 1){
        const [first] = hostPropToAttrMap;
        const {type, name} = first;
        if(type === '$'){
            const {model} = transformer;
            const subModel = (<any>model)[name]
            if(Array.isArray(subModel)){
                const {ForEachImpl, forEachImpls} = await import('./ForEachImpl.js');
                let forEachImpl: ForEachInterface | undefined;
                if(forEachImpls.has(matchingElement)){
                    throw 'NI';
                }else{
                    forEachImpl = new ForEachImpl(
                        matchingElement, uows, mo);
                    forEachImpls.set(matchingElement, forEachImpl);
                    await forEachImpl.init();
                }
                
            }else{
                const {doNestedTransforms} = await import('./doNestedTransforms.js');
                await doNestedTransforms(matchingElement, first, subModel, uows, mo);
            }
            //return;
        } 
    } 
        
    for(const uow of uows){
        const {w, y} = uow;
        if(w !== undefined){
            switch(typeof w){
                case 'string':
                    if(!matchingElement.matches(w)) continue;
            }
        }
        if(y !== undefined){
            const {doYield} = await import('./doYield.js');
            await doYield(transformer, matchingElement, uow, y);
        }else{
            //this is where we could look to see if we need to do update if already updated by server
            if(!skipInit || !ctx.initializing){
                await mo.doUpdate(matchingElement, uow);
            }
        }

        
        matchingElements.push(new WeakRef(matchingElement));
        await transformer.engage(matchingElement, 'onMount', uow, observer, ctx);
        const {a, m} = uow;
        if(a !== undefined){
            let transpiledActions: Array<AddEventListener<TProps, TMethods>> | undefined;
            if(typeof a === 'string'){
                transpiledActions = [mo.toStdEvt(a, matchingElement)];
            }else{
                transpiledActions = arr0(a).map(ai => typeof ai === 'string' ? mo.toStdEvt(ai, matchingElement) : ai);
            }
            const {AddEventListener} = await import('./AddEventListener.js')
            for(const ap of transpiledActions!){
                const {on, do: action, options} = ap;
                new AddEventListener<TProps, TMethods, TElement>(
                    mountObserver, 
                    transformer,
                    uow,
                    matchingElement,
                    on,
                    action,
                );
            }
        }
        if(m !== undefined){
            const transpiledMs = arr0(m);
            const {Mod} = await import('./Mod.js');
            for(const mi of transpiledMs){
                new Mod<TProps, TMethods, TElement>(mountObserver, transformer, matchingElement, mi);
            }
            
        }

    }
    
}