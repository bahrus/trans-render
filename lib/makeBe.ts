import {CSSSelectorBeHavingMap, Attachable} from './types';

export function makeBe(instance: Element, cssSelector: string, make: CSSSelectorBeHavingMap){
    const beHavingOrBeHavings = make[cssSelector];
    const beHavings = Array.isArray(beHavingOrBeHavings) ? beHavingOrBeHavings : [beHavingOrBeHavings];
    for(const beHaving of beHavings){
        const {be, having} = beHaving;
        const wcName = 'be-' + be;
        const aInstance = instance as any;
        if(aInstance.beDecorated === undefined) aInstance.beDecorated = {};
        const attrib = instance.getAttribute(wcName);
        const having2  = {...having} || {};
        if(attrib && attrib.startsWith('{')){
            const val = JSON.parse(attrib);
            Object.assign(having2, val);
        }
        aInstance.beDecorated[be] = having2;
        if(customElements.get(wcName)){
            const dem = document.createElement(wcName) as any as Attachable;
            dem.attach.bind(instance);
        }else{
            instance.setAttribute(wcName, '');
        }

    }
}

export function makeItBe(fragment: Element | DocumentFragment, make: CSSSelectorBeHavingMap){
    for(const key in make){
        fragment.querySelectorAll(key).forEach(instance => {
            makeBe(instance, key, make);
        });
    }
}