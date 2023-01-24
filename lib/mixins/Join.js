export const transformJoin = 'transform-join';
export class Join {
    transformer;
    constructor(transformer, fragment) {
        this.transformer = transformer;
        const childElements = Array.from(fragment.children);
        let foundMatch = false;
        fragment.querySelectorAll(`${transformJoin},data-${transformJoin}`).forEach(match => {
            foundMatch = true;
            const joinAttr = match.getAttribute(transformJoin) || match.getAttribute(`data-${transformJoin}`);
            const transformMatch = JSON.parse(joinAttr);
            const newMatch = join(transformer.ctx.match, transformMatch);
            transformer.ctx.match = newMatch;
            match.removeAttribute(transformJoin);
            match.removeAttribute(`data-${transformJoin}`);
        });
        if (foundMatch) {
            transformer.flushCache();
            transformer.transform(fragment);
        }
        for (const el of childElements) {
            el.addEventListener('transform-join', async (e) => {
                const { detail } = e; // as TransformJoinEvent;
                if (detail !== undefined) {
                    const joinEvent = detail;
                    const { match } = joinEvent;
                    if (match !== undefined) {
                        const newMatch = join(transformer.ctx.match, match);
                        transformer.ctx.match = newMatch;
                    }
                    joinEvent.acknowledged = true;
                }
                const { target } = e;
                await transformer.transform([target]);
                transformer.flushCache();
            });
        }
    }
}
function join(lhs, rhs) {
    const lhsGrouped = group(lhs);
    const rhsGrouped = group(rhs);
    const returnObj = {};
    for (const key in lhsGrouped) {
        let val = lhsGrouped[key];
        const addend = rhsGrouped[key];
        if (addend !== undefined) {
            val = val.concat(addend);
        }
        let count = 0;
        ;
        let dupKey = '^';
        for (const m of val) {
            if (count === 0) {
                returnObj[key] = m;
            }
            else {
                returnObj[dupKey] = m;
            }
            count++;
            dupKey = '^' + count;
        }
    }
    return returnObj;
}
function group(match) {
    const returnObj = {};
    let lastKey = '';
    for (const key in match) {
        let realKey = key;
        if (key[0] === '^') {
            realKey = lastKey;
        }
        else {
            lastKey = key;
        }
        if (returnObj[realKey] === undefined) {
            returnObj[realKey] = [];
        }
        const rhs = match[realKey];
        returnObj[key].push(rhs);
    }
    return returnObj;
}
