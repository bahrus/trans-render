//TODO:  deprecate (moved to mount-observer)
export function splitRefs(refs: string){
    return refs
    .split(' ')
    .map(s => s.trim())
    .filter(s => !!s);
}