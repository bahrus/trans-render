export async function setProp(obj: any, path: string, val: any){
    const splitPath = path.split('.');
    const last = splitPath.pop()!;
    let context = obj;
    for(const token of splitPath){
        switch(token){
            case '':
                continue;
            case '$':
                {
                    const {CtxNav} = await import('./CtxNav.js');
                    context = new CtxNav(context).beScoped;
                }
                break;
            case '$$':
                {
                    const {CtxNav} = await import('./CtxNav.js');
                    context = new CtxNav(context);
                }
                break;
            default:
                let newContext = context[token];
                if(newContext === undefined){
                    context[token] = {};
                    newContext = context[token];
                }
                context = newContext;

        }

    }
    context[last] = val;
}