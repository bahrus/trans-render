const ttGuid = '0j9qIjjR+UWYLrZ3FskVig';
export function getCount(baseID) {
    const key = Symbol.for(ttGuid + baseID);
    let returnCnt = window[key] || 0;
    const nextCnt = returnCnt + 1;
    window[key] = nextCnt;
    return returnCnt;
}
