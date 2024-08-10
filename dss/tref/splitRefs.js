export function splitRefs(refs) {
    return refs
        .split(' ')
        .map(s => s.trim())
        .filter(s => !!s);
}
