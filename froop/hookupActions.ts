import {Action, IActionProcessor} from '../lib/types';
import {pc, pbk, trpb} from './const.js';
import {PropBag} from './AddProps.js';
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
            const {pq} = await import('../lib/pq.js');
            const {intersection} = await import('../lib/intersection.js');
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
                const {} = await import('./doActions.void')
            }
        })();
    });
}




