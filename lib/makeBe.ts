import {CSSSelectorBeHavingMap} from './types';
import {getQuery} from './specialKeys.js';


export async function makeBe(fragment: Element | DocumentFragment | Element[], make: CSSSelectorBeHavingMap){
    for(const key in make){
        let cssSelector = key;
        if(hasCapitalLetterRegExp.test(key)){
            const q = getQuery(key);
            cssSelector = q.query;
        }
        if(Array.isArray(fragment)){
            for(const el of fragment){
                if(el.matches(cssSelector)){
                    await makeItBe(el, key, make);
                }
                const all = Array.from(el.querySelectorAll(cssSelector));
                for(const instance of all){
                    await makeItBe(instance, key, make);
                }               
            }
        }else{
            const all = Array.from(fragment.querySelectorAll(cssSelector));
            for(const instance of all){
                await makeItBe(instance, key, make);
            }
        }

    }
}

// async function doMakes(fragment: Element | DocumentFragment, cssSelector: string, key: string){

// }

const hasCapitalLetterRegExp = /[A-Z]/;

export async function makeItBe(instance: Element, key: string, make: CSSSelectorBeHavingMap){
    const beHavingOrBeHavings = make[key];
    const beHavings = Array.isArray(beHavingOrBeHavings) ? beHavingOrBeHavings : [beHavingOrBeHavings];
    const {doBeHavings} = await import('./doBeHavings.js');
    await doBeHavings(instance, beHavings);
}



 

