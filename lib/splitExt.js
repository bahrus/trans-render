export function splitExt(val) {
    const split = val.split('.');
    return split.map(s => {
        const subSplit = s.split('|');
        if (subSplit.length > 1)
            return subSplit;
        return s;
    });
}
