export async function getVal(host:any, path: string): Promise<string>{
    if(host === undefined) return path;
    if(path[0] !== '.') return host[path];
    path = path.substr(1);
    const qSplit = path.split('??');
    let deflt = qSplit[1];
    const dSplit = qSplit[0].trim().split('.');
    const {getProp} = await import('./getProp.js');
    let val = getProp(host, dSplit);
    if(val === undefined && deflt){
        deflt = deflt.trim();
        if(deflt[0] === "."){
            return await getVal(host, deflt);
        }else{
            return deflt;
        }
    }
    return val;
}