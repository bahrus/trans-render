import { getQuery } from './specialKeys.js';
export function makeBe(fragment, make) {
    for (const key in make) {
        let cssSelector = key;
        if (hasCapitalLetterRegExp.test(key)) {
            const q = getQuery(key);
            cssSelector = q.query;
        }
        fragment.querySelectorAll(cssSelector).forEach(instance => {
            makeItBe(instance, key, make);
        });
    }
}
const hasCapitalLetterRegExp = /[A-Z]/;
export function makeItBe(instance, key, make) {
    const beHavingOrBeHavings = make[key];
    const beHavings = Array.isArray(beHavingOrBeHavings) ? beHavingOrBeHavings : [beHavingOrBeHavings];
    for (const beHaving of beHavings) {
        const { be, having } = beHaving;
        const wcName = 'be-' + be;
        const aInstance = instance;
        if (aInstance.beDecorated === undefined)
            aInstance.beDecorated = {};
        const attrib = instance.getAttribute(wcName);
        const having2 = { ...having || {} };
        if (attrib && attrib.startsWith('{')) {
            const val = JSON.parse(attrib);
            Object.assign(having2, val);
        }
        aInstance.beDecorated[be] = having2;
        if (customElements.get(wcName)) {
            const dem = document.createElement(wcName);
            dem.attach(instance);
        }
        else {
            instance.setAttribute(wcName, '');
        }
    }
}
