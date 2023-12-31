import {setProp} from './setProp.js';
export function setEnhProp(obj: any, path: string, val: any){
    path = path.replace('+', "beEnhanced.by.");
    setProp(obj, path, val);
}