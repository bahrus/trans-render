import 'mount-observer/refid/hostish.js';
import { Specifier } from "../ts-refs/trans-render/dss/types";

function getByIdInclusive(fragment: Node, id: string){
    if(fragment instanceof Element && fragment.id === id) return fragment;
    if(fragment instanceof DocumentFragment) return fragment.getElementById(id);
    if(fragment instanceof Element) return fragment.querySelector(`#${id}`);
    throw 'NI';
}

export async function find(el: Element, specifier: Specifier){
    const {id, host} = specifier;
    if(id !== undefined) return getByIdInclusive(el.getRootNode(), id);
    if(host === true) return (<any>el.getRootNode()).host as HTMLElement | undefined;
    return (await (<any>el).hostish()) as EventTarget;
}