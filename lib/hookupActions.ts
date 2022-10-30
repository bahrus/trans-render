import {Action, IActionProcessor} from './types';
import {PropBag, pc, pbk, trpb} from './addProps2.js';
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
        })();
    });
}


