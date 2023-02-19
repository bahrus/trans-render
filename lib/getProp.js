export async function getProp(val, pathTokens) {
    let context = val;
    for (const token of pathTokens) {
        switch (token) {
            case '':
                continue;
            // case '$':
            //   {
            //     const { CtxNav } = await import('./CtxNav.js');
            //     context = new CtxNav(context).beScoped;
            //   }
            //   break;
            // case '$$':
            //   {
            //     const { CtxNav } = await import('./CtxNav.js');
            //     context = new CtxNav(context);
            //   }
            //   break;
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
