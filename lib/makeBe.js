import { getQuery } from './specialKeys.js';
export async function makeBe(fragment, make) {
    for (const key in make) {
        let cssSelector = key;
        if (hasCapitalLetterRegExp.test(key)) {
            const q = getQuery(key);
            cssSelector = q.query;
        }
        if (Array.isArray(fragment)) {
            for (const el of fragment) {
                if (el.matches(cssSelector)) {
                    makeItBe(el, key, make);
                }
                el.querySelectorAll(cssSelector).forEach(instance => {
                    makeItBe(instance, key, make);
                });
            }
        }
        else {
            fragment.querySelectorAll(cssSelector).forEach(instance => {
                makeItBe(instance, key, make);
            });
        }
    }
}
const hasCapitalLetterRegExp = /[A-Z]/;
export async function makeItBe(instance, key, make) {
    const beHavingOrBeHavings = make[key];
    const beHavings = Array.isArray(beHavingOrBeHavings) ? beHavingOrBeHavings : [beHavingOrBeHavings];
    const { doBeHavings } = await import('./doBeHavings.js');
    await doBeHavings(instance, beHavings);
}
