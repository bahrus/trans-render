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
