export function splitExt(val: string){
    const split = val.split('.');
    return split.map(s => {
        const subSplit = s.split('|');
        if(subSplit.length > 1) return subSplit;
        return s;
    })
}