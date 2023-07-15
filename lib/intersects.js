export function intersects(setA, setB) {
    for (let elem of setB) {
        if (setA.has(elem))
            return true;
    }
    return false;
}
