import {appendTag} from './appendTag';
import { append } from './append';
export function injectModule(path: string){
    appendTag(document.head, 'script', {
        attribs:{
            type: 'module'
        },
        propVals:{
            innerHTML: `
            import "${path}";
            `
        }
    });
}