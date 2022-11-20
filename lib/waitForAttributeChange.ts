import {wfac} from './wfac.js';
export function waitForAttributeChange(el: HTMLElement, attributeName: string, test?: (s: string | null) => boolean){
    return wfac(el, attributeName, test);
}