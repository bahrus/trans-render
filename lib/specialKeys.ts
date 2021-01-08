import { camelToLisp } from "./camelToLisp.js";

export const attribs = ['id', 'part', 'class', 'data', 'element'];

export interface queryInfo{
    query: string;
    attrib: string;
    type: string;
}

export function getQuery(key: string){
    const lpKey = camelToLisp(key);
    for(const type of attribs){
        if(lpKey.endsWith(type)){
            const attrib = lpKey.substr(0, lpKey.length - type.length - 1);
            switch(type){
                case 'id':{
                    const query = `#${attrib}`;
                    return {query, type, attrib};
                }
                case 'part':{
                    const query = `[part~="${attrib}"]`;
                    return {query, type, attrib};
                }
                case 'class':{
                    const query = `.${attrib}`;
                    return {query, type, attrib};
                }
                case 'data':{
                    const realAttrib = `data-${attrib}`;
                    const query = `[${realAttrib}]`;
                    return {query, type, attrib: realAttrib};
                }
                case 'element':{
                    const query = attrib;
                    return {query, type, attrib};
                }
                default:
                    
            }           
        }
    }
    return null;
}