import { wfac } from './wfac.js';
export function waitForAttributeChange(el, attributeName, test) {
    return wfac(el, attributeName, test);
}
