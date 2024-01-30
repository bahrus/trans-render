import { MountObserver } from '../../mount-observer/MountObserver.js';
import { IMountObserver, MountContext } from '../../mount-observer/types.js';
import {Transformer, MountOrchestrator, arr} from '../Transform.js';
import {QuenitOfWork, AddEventListener} from '../types.js';

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
            if(Array.isArray((<any>model)[name])){
                throw 'NI';
            }else{
                const {doNestedTransforms} = await import('./doNestedTransforms.js');
                await doNestedTransforms(matchingElement, uows, mo);
            }
            return;
        } 
    } 
        
    for(const uow of uows){
        const {w} = uow;
        if(w !== undefined){
            switch(typeof w){
                case 'string':
                    if(!matchingElement.matches(w)) continue;
            }
        }
        //this is where we could look to see if we need to do update if already updated by server
        if(!skipInit || !ctx.initializing){
            await mo.doUpdate(matchingElement, uow);
        }
        
        matchingElements.push(new WeakRef(matchingElement));
        await transformer.engage(matchingElement, 'onMount', uow, observer, ctx);
        const {a, m} = uow;
        if(a !== undefined){
            let transpiledActions: Array<AddEventListener<TProps, TMethods>> | undefined;
            if(typeof a === 'string'){
                transpiledActions = [mo.toStdEvt(a, matchingElement)];
            }else{
                transpiledActions = arr(a).map(ai => typeof ai === 'string' ? mo.toStdEvt(ai, matchingElement) : ai);
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
            const transpiledMs = arr(m);
            const {Mod} = await import('./Mod.js');
            for(const mi of transpiledMs){
                new Mod<TProps, TMethods, TElement>(mountObserver, transformer, matchingElement, mi);
            }
            
        }
    }
    
}