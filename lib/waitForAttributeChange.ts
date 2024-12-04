import {wfac} from './wfac.js';
export async  function waitForAttributeChange(el: Element, attributeName: string, test?: (mr: MutationRecord, el: Element, attributeNameOrNames: string | Array<string>) => boolean){
    return await wfac(el, attributeName, test);
}