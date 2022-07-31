import { camelToLisp } from "./camelToLisp.js";
import {QueryInfo, matchTypes} from './types';

export const attribs : matchTypes[] = ['parts', 'part', 'id', 'classes', 'attribs', 'elements', 'props'];

const attribsUC = attribs.map(s => s[0].toUpperCase() + s.substr(1));


export function getQuery(key: string): QueryInfo{
    const lpKey = camelToLisp(key);
    let idx = 0;
    for(const type of attribs){
        if(key.endsWith(attribsUC[idx])){
            const attrib = lpKey.substr(0, lpKey.length - type.length - 1);
            let query: string | undefined;
            let verb: string = 'querySelectorAll';
            const single = 'querySelector';
            let getFirstIfNotNull = false;
            let lhsProp = '';
            switch(type){
                case 'parts':
                case 'part':
                    query = `[part*="${attrib}"]`;
                    break;
                case 'classes':
                case 'class':
                    query = attrib;
                    verb = 'getElementsByClassName';
                    break;
                case 'attribs':
                case 'attrib':
                    query = `[${attrib}]`;
                    break;
                case 'elements':
                case 'element':
                    query = attrib;
                    verb = 'getElementsByTagName';
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
                    break;
                }
                case 'attrib':
                case 'class':
                case 'element':
                    getFirstIfNotNull = true;
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
                return {query, type, attrib, lhsProp};
            }           
        }
        idx++;
    }
    return {
        query: key
    };
}