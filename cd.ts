import {getChildFromSinglePath} from './getChildFromSinglePath.js';

export function cd(el: HTMLElement, path: string, pathHistory?: string[]){
    const splitPath = path.split('/');
    let ctx = el;
    splitPath.forEach(token =>{
        if(!token) return;
        if(pathHistory) pathHistory.push(token);
        ctx = getChildFromSinglePath(ctx, token) as HTMLElement;
       
    })
    return ctx;
}