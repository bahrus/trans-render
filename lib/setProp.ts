export function setProp(obj: any, path: string, val: any){
    const splitPath = path.split('.');
    const last = splitPath.pop()!;
    let context = obj;
    for(const token of splitPath){
        if(token==='') continue;
        let newContext = context[token];
        if(newContext === undefined){
            context[token] = {};
            newContext = context[token];
        }
        context = newContext;
    }
    context[last] = val;
}