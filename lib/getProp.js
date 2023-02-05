export async function getProp(val, pathTokens) {
    let context = val;
    for (const token of pathTokens) {
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
                switch (typeof token) {
                    case 'string':
                        context = context[token];
                        break;
                    default:
                        //allow for method calls
                        if (token[1] === '') {
                            context = context[token[0]]();
                        }
                        else {
                            //TODO:  try JSON.parse(token[1])
                            context = context[token[0]](token[1]);
                        }
                }
        }
        if (context === undefined)
            break;
    }
    return context;
}
