import { Specifier } from "../ts-refs/trans-render/dss/types";

export async function find(el: Element, specifier: Specifier){
    const {id, host} = specifier;
    if(id !== undefined) return (el.getRootNode() as DocumentFragment).getElementById(id);
    if(host === true) return (<any>el.getRootNode()).host as HTMLElement | undefined;
    return (await (<any>el).getHostish()) as EventTarget;
}