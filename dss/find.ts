import { Specifier } from "../ts-refs/trans-render/dss/types";
import {ZeroOrMore} from '../types';
export async function find(element: Element, specifier: Specifier, within?: ZeroOrMore<Element>){
    const {self, s} = specifier;
    if(self) return element;
    if(s === '#'){
        const {arr} = await import('../arr.js');
        const {elS} = specifier;
        const rns = (arr(within) || [element.getRootNode()]) as Array<Element>;
        for(const rn of rns){
            const el = (rn instanceof DocumentFragment) ? rn.getElementById(elS!) : rn.querySelector('#' + elS);
            if(el !== null) return el;
        }
    }
    const {findR} = await import('./findR.js');
    return await findR(element, specifier, within);
}

export function getSubProp(specifier: Specifier, el: HTMLElement){
    const {path} = specifier;
    return path || el.getAttribute('itemprop') || (<HTMLInputElement>el).name || el.id;
}

