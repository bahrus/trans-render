export function intersects<T = string>(setA: Set<T>, setB: Set<T>){
    for(let elem of setB){
        if(setA.has(elem)) return true;
    }
    return false;
}