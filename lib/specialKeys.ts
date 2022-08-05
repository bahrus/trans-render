import { camelToLisp } from "./camelToLisp.js";
import {QueryInfo, matchTypes} from './types';

export const attribs : matchTypes[] = ['parts', 'part', 'id', 'classes', 'attribs', 'elements', 'props', 'names', 'name'];

const attribsUC = attribs.map(s => s[0].toUpperCase() + s.substr(1));

const match = (e: Element, attrib: string) => e.matches(attrib);
const matchClass = (e: Element, attrib: string) => e.classList.contains(attrib);
const matchAtr = (e: Element, attrib: string) => e.hasAttribute(attrib);
const matchEl = (e: Element, attrib: string) => e.localName === attrib;
const matchId = (e: Element, attrib: string) => e.id === attrib;
const matchName = (e: Element, attrib: string) => (e as HTMLFormElement).name === attrib;

export function getQuery(key: string): QueryInfo{
    const lpKey = camelToLisp(key);
    let idx = 0;
    for(const type of attribs){
        if(key.endsWith(attribsUC[idx])){
            const attrib = lpKey.substr(0, lpKey.length - type.length - 1);
            let query: string | undefined;
            let verb: keyof Document & string = 'querySelectorAll';
            let matchFn: undefined |  ((el: Element, attrib: string) => boolean) ;
            const single = 'querySelector';
            let first = false;
            let lhsProp = '';
            switch(type){
                case 'parts':
                case 'part':
                    query = `[part*="${attrib}"]`;
                    break;
                case 'classes':
                case 'class':
                    //query = attrib;
                    //console.log(query);
                    query = `.${attrib}`;
                    //verb = 'getElementsByClassName';
                    matchFn = matchClass;
                    break;
                case 'attribs':
                case 'attrib':
                    query = `[${attrib}]`;
                    matchFn = matchAtr;
                    break;
                case 'elements':
                case 'element':
                    query = attrib;
                    verb = 'getElementsByTagName';
                    matchFn = matchEl;
                    break;
                case 'names':
                case 'name':
                    query = attrib;
                    verb = 'getElementsByName';
                    matchFn = matchName;
                    break;

            }
            switch(type){
                case 'part': {
                    verb = single;
                    break;
                }
                case 'id': {
                    query = attrib;
                    verb = 'getElementById';
                    matchFn = matchId;
                    break;
                }
                case 'attrib':
                case 'class':
                case 'element':
                case 'name':
                    first = true;
                    break;

                case 'placeholders':{
                    query = attrib + '-';
                    break;
                }
                case 'props': {
                    query = `[-${attrib}]`;
                    lhsProp = key.substr(0, key.length - 5);
                    break;
                }
            }
            if(query !== undefined){
                return {query, type, attrib, lhsProp, verb, first, matchFn};
            }           
        }
        idx++;
    }
    return {
        query: key,
        verb: 'querySelectorAll',
    };
}