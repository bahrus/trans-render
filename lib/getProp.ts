export function getProp(val: any, pathTokens: string[]){
    let context = val;
    for(const token of pathTokens){
      context = context[token];
      if(context === undefined) break;
    }
    return context;
}