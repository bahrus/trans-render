export function toParts(expr) {
    const closedBraceSplit = expr.split('}');
    const parts = [];
    for (const cb of closedBraceSplit) {
        if (cb.indexOf('{') > -1) {
            const openBraceSplit = cb.split('{');
            parts.push(openBraceSplit[0]);
            const prop = {};
            parts.push([openBraceSplit[1], prop]);
        }
        else {
            parts.push(cb);
        }
    }
    return parts;
}
export function getBounds(val, parts) {
    const boundaries = [];
    let cursorPos = 0;
    for (const part of parts) {
        switch (typeof part) {
            case 'string':
                cursorPos = val.indexOf(part, cursorPos);
                boundaries.push([cursorPos, cursorPos + part.length]);
                cursorPos += part.length;
        }
    }
    return boundaries;
}
export function getPartVals(val, parts) {
    const boundaries = getBounds(val, parts);
    const vals = [];
    for (let i = 0, ii = boundaries.length - 1; i < ii; i++) {
        const boundary = boundaries[i];
        const boundaryPlusOne = boundaries[i + 1];
        const start = boundary[1];
        const end = boundaryPlusOne[0];
        vals.push(val.substring(start, end));
    }
    return vals;
}
