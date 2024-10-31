export function splitOnce(s, divider) {
    const iPosOfDividor = s.indexOf(divider);
    if (iPosOfDividor === -1)
        return [s, undefined];
    return [s.substring(0, iPosOfDividor), s.substring(iPosOfDividor + divider.length)];
}
