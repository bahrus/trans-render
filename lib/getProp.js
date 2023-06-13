export async function getProp(val, pathTokens) {
    let context = val;
    for (const token of pathTokens) {
        switch (token) {
            case '':
                continue;
            default:
                switch (typeof token) {
                    case 'string':
                        context = context[token];
                        break;
                    default:
                        //allow for method calls
                        if (token[1] === '') {
                            context = await context[token[0]]();
                        }
                        else {
                            //TODO:  try JSON.parse(token[1])
                            context = await context[token[0]](token[1]);
                        }
                }
        }
        if (context === undefined)
            break;
    }
    return context;
}
