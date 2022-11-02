import {Action, IActionProcessor} from '../lib/types';
import {pc} from './const.js';
import {PropBag} from './AddProps.js';
import {DefineArgsWithServices} from './types';


export function hookupActions(instance: EventTarget, propBag: PropBag, args: DefineArgsWithServices){
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
                const {} = await import('./doActions.js')
            }
        })();
    });
}




