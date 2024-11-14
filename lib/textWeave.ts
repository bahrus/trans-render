export async function weave(textNodes: string[], host: any){
    return (await Promise.all(textNodes.map(async (path, idx) => {
        if(idx % 2 === 0) return path;
        const {getVal} = await import ('./getVal.js');
        return await getVal({host}, path) as string;
    }))).join('');
}