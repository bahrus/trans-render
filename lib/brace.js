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
                if (part === '')
                    continue;
                boundaries.push([cursorPos, cursorPos + part.length]);
                cursorPos += part.length;
        }
    }
    return boundaries;
}
export function getPartVals(val, parts) {
    const boundaries = getBounds(val, parts);
    const vals = [];
    //let boundaryPlusOne: number[] = [];
    for (let i = 0, ii = boundaries.length; i < ii; i++) {
        const boundary = boundaries[i];
        if (boundary[0] > 0) {
        }
        if (i === ii - 1) {
            const start = boundary[1];
            vals.push(val.substring(start));
        }
        else {
            if (i === 0) {
                if (boundary[0] > 0) {
                    vals.push(val.substring(0, boundary[0]));
                }
            }
            const boundaryPlusOne = boundaries[i + 1];
            const start = boundary[1];
            const end = boundaryPlusOne[0];
            const betweenBoundaries = val.substring(start, end);
            vals.push(betweenBoundaries);
        }
    }
    return vals;
}
export function getParsedObject(val, parts) {
    const partVals = getPartVals(val, parts);
    let cnt = 0;
    const parsedObject = {};
    for (const part of parts) {
        switch (typeof part) {
            case 'object':
                parsedObject[part[0]] = partVals[cnt];
                cnt++;
                break;
        }
    }
    return parsedObject;
}
