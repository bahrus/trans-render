import {TransformPacket, TemplMgmtBase} from '../types';
import {TemplMgmtBaseMixin} from './TemplMgmt.js';
import {MainTransforms} from './MainTransforms.js';
export function HomeIn(
    self:  TemplMgmtBaseMixin & HTMLElement, 
    {hydratingTransform, transformPlugins, DTRCtor, homeInOn}: TemplMgmtBase,
    fragment: DocumentFragment
){
    for(const key in homeInOn){
        const host = (<any>self)[key];
        if(!(host instanceof EventTarget)){
            throw `Property ${key} not of type EventTarget`;
        }
        const transformPacket = homeInOn[key];
        const base: TransformPacket = {
            transformPlugins,
            DTRCtor,
            ...transformPacket,
        }
        MainTransforms(host, base, fragment);
    }
}