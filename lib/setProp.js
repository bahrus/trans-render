export async function setProp(obj, path, val) {
    const splitPath = path.split('.');
    const last = splitPath.pop();
    let context = obj;
    for (const token of splitPath) {
        switch (token) {
            case '':
                continue;
            case '$':
                {
                    const { ScopeNavigator } = await import('./ScopeNavigator.js');
                    context = new ScopeNavigator(context).scope;
                }
                break;
            case '$$':
                {
                    const { ScopeNavigator } = await import('./ScopeNavigator.js');
                    context = new ScopeNavigator(context);
                }
                break;
            default:
                let newContext = context[token];
                if (newContext === undefined) {
                    context[token] = {};
                    newContext = context[token];
                }
                context = newContext;
        }
    }
    context[last] = val;
}
