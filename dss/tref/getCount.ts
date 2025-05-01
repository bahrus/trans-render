const ttGuid = '0j9qIjjR+UWYLrZ3FskVig'
export function getCount(baseID: string){
    const key = Symbol.for(ttGuid + baseID);
    let returnCnt = (<any>window)[key] || 0;
    const nextCnt = returnCnt + 1;
    (<any>window)[key] = nextCnt;
    return returnCnt;
}