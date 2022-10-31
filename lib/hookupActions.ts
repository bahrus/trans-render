import {Action, IActionProcessor} from './types';
import {PropBag, pc, pbk, trpb} from '../froop/addProps.js';
export function hookupActions(instance: EventTarget, actions: {[methodName: string]: Action}, dryProps: Set<string>){
    const propBag = (<any>instance)[pbk] as PropBag;
    if(propBag !== undefined){
        doHookup(instance, propBag, actions, dryProps);
    }else{
        instance.addEventListener(trpb, e => {
            doHookup(instance, (<any>instance)[pbk] as PropBag, actions, dryProps);
        }, {once: true});
    }
}

function doHookup(instance: EventTarget, propBag: PropBag, actions: {[methodName: string]: Action}, nonDryProps: Set<string>){
    propBag.addEventListener(pc, e => {
        const chg = (e as CustomEvent).detail;
        const {key, oldVal, newVal} = chg;
        if(!nonDryProps.has(key)){
            if(oldVal === newVal) return;
        }
        propBag.dk.add(key);
        (async () => {
            const filteredActions: any = {};
            const {pq} = await import('./pq.js');
            const {intersection} = await import('./intersection.js');
            const changedKeys = propBag.dk;
            propBag.dk = new Set<string>();
            let foundAction = false;
            for(const methodName in actions){
                const action = actions[methodName]!;
                const typedAction = (typeof action === 'string') ? {ifAllOf:[action]} as Action : action as Action;
                const props = getPropsFromAction(typedAction); //TODO:  cache this
                const int = intersection(props, changedKeys);
                if(int.size === 0) continue;
                if(await pq(typedAction, instance)){
                    filteredActions[methodName] = action;
                    foundAction = true;
                }
            }
            if(foundAction){
                const {} = await import('../froop/doActions.js')
            }
        })();
    });
}

function getPropsFromAction(action: Action): Set<string>{
    return typeof(action) === 'string' ? new Set<string>([action]) : new Set<string>([
        ...(action.ifAllOf || []) as string[], 
        ...(action.ifKeyIn || []) as string[], 
        ...(action.ifNoneOf || []) as string[],
        ...(action.ifEquals || []) as string[],
        ...(action.ifAtLeastOneOf || []) as string[]
    ]);    
}


