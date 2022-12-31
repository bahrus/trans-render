import {CSSSelectorBeHavingMap, Attachable} from './types';
import {getQuery} from './specialKeys.js';
import { lispToCamel } from './lispToCamel.js';

export function makeBe(fragment: Element | DocumentFragment, make: CSSSelectorBeHavingMap){
    for(const key in make){
        let cssSelector = key;
        if(hasCapitalLetterRegExp.test(key)){
            const q = getQuery(key);
            cssSelector = q.query;
        }
        fragment.querySelectorAll(cssSelector).forEach(instance => {
            makeItBe(instance, key, make);
        });
    }
}

const hasCapitalLetterRegExp = /[A-Z]/;

export function makeItBe(instance: Element, key: string, make: CSSSelectorBeHavingMap){
    const beHavingOrBeHavings = make[key];
    const beHavings = Array.isArray(beHavingOrBeHavings) ? beHavingOrBeHavings : [beHavingOrBeHavings];
    for(const beHaving of beHavings){
        const {be, having} = beHaving;
        const wcName = 'be-' + be;
        const aInstance = instance as any;
        if(aInstance.beDecorated === undefined) aInstance.beDecorated = {};
        const attrib = instance.getAttribute(wcName);
        const having2  = {...having || {}};
        if(attrib && attrib.startsWith('{')){
            const val = JSON.parse(attrib);
            Object.assign(having2, val);
        }
        const camelBe = lispToCamel(be);
        const existingSettings = aInstance.beDecorated[camelBe];
        let alreadyAttached = false;
        if(existingSettings !== undefined){
            alreadyAttached = existingSettings.controller !== undefined;
            Object.assign(existingSettings, having2);
        }else{
            aInstance.beDecorated[camelBe] = having2;
        }
        
        if(!alreadyAttached){
            customElements.whenDefined(wcName).then(() => {
                const decorator = document.createElement(wcName) as any as Attachable;
                decorator.attach(instance);
            });
        }

    }
}

