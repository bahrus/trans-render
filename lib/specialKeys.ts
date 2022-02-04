import { camelToLisp } from "./camelToLisp.js";
import {queryInfo, matchTypes} from './types';

export const attribs : matchTypes[] = ['parts', 'classes', 'attribs', 'elements', 'props'];

const attribsUC = attribs.map(s => s[0].toUpperCase() + s.substr(1));


export function getQuery(key: string): queryInfo{
    const lpKey = camelToLisp(key);
    let idx = 0;
    for(const type of attribs){
        if(key.endsWith(attribsUC[idx])){
            const attrib = lpKey.substr(0, lpKey.length - type.length - 1);
            let query: string | undefined;
            let lhsProp = '';
            switch(type){
                case 'parts':{
                    query = `[part*="${attrib}"]`;
                    break;
                }
                case 'classes':{
                    query = `.${attrib}`;
                    break;
                }
                case 'attribs':{
                    query = `[${attrib}]`;
                    break;
                }
                case 'elements':{
                    query = attrib;
                    break;
                }
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
                return {query, type, attrib, lhsProp};
            }           
        }
        idx++;
    }
    return {
        query: key
    };
}