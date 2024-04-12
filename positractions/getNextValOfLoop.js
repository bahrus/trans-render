export const getNextValOfLoop = (currentVal, from, to, step = 1, loopIfMax = false) => {
    console.log('getNextValOfLoop');
    let hitMax = false, nextVal = currentVal, startedLoop = false;
    if (currentVal === undefined || currentVal === null || currentVal < from) {
        nextVal = from;
        startedLoop = true;
    }
    else {
        const possibleNextVal = currentVal + step;
        if (possibleNextVal > to) {
            if (loopIfMax) {
                nextVal = from;
            }
            else {
                hitMax = true;
            }
        }
        else {
            nextVal = possibleNextVal;
        }
    }
    return [nextVal, hitMax, startedLoop];
};
