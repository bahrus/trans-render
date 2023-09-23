import { findRealm } from '../lib/findRealm.js';
export async function findItemProp(el) {
    return findRealm(el, ['wis', 'isHappy']);
}
