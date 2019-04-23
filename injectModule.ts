import {appendTag} from './appendTag';
import { append } from './append';
export function injectModule(script: string){
    appendTag(document.head, 'script', {
        attribs:{
            type: 'module'
        },
        propVals:{
            innerHTML: script
        }
    });
}