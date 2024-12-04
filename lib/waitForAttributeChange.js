import { wfac } from './wfac.js';
export async function waitForAttributeChange(el, attributeName, test) {
    return await wfac(el, attributeName, test);
}
