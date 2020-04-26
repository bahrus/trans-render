import {appendTag} from './appendTag';
export function injectModuleScript(script: string){
    appendTag(document.head, 'script', {
        attribs:{
            type: 'module'
        },
        propVals:{
            innerHTML: script
        }
    });
}
const modulePath = Symbol('modulePath');
const lookup: {[key: string] : boolean} = {};
(<any>window)[modulePath] = lookup;

export function injectModuleRef(path: string){
    if(lookup[path]) return;
    injectModuleScript(`
import '${path}';
    `);
    lookup[path] = true;
}