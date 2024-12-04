import {wfac} from './wfac.js';
export function waitForAttributeChange(el: HTMLElement, attributeName: string, test?: (mr: MutationRecord, el: HTMLElement, attributeNameOrNames: string | Array<string>) => boolean){
    return wfac(el, attributeName, test);
}