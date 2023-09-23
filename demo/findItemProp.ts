import {findRealm} from '../lib/findRealm.js';
export async function findItemProp(el: Element){
    return findRealm(el, ['wis', 'isHappy']);
}