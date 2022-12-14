import {CSSSelectorBeHavingMap, Attachable} from './types';

export function makeBe(instance: Element, cssSelector: string, make: CSSSelectorBeHavingMap){
    const beHavingOrBeHavings = make[cssSelector];
    const beHavings = Array.isArray(beHavingOrBeHavings) ? beHavingOrBeHavings : [beHavingOrBeHavings];
    for(const beHaving of beHavings){
        const {be, having} = beHaving;
        const wcName = 'be-' + be;
        const aInstance = instance as any;
        if(aInstance.beDecorated === undefined) aInstance.beDecorated = {};
        aInstance.beDecorated[be] = having;
        if(customElements.get(wcName)){
            const dem = document.createElement(wcName) as any as Attachable;
            dem.attach.bind(instance);
        }else{
            instance.setAttribute(wcName, '');
        }

    }
}