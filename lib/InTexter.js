const weakMap = new WeakMap();
export class InTexter {
    do(ctx) {
        let text = ctx.rhs;
        const target = ctx.target;
        const host = ctx.host;
        if (host !== undefined && text.includes('|')) {
            let nestedString = weakMap.get(target);
            if (nestedString === undefined) {
                const split = text.split('|');
                nestedString = split.map(s => {
                    if (s[0] !== '.')
                        return s;
                    const optionalChain = s.split('??');
                    return optionalChain.length === 1 ? optionalChain[0] : optionalChain;
                });
                weakMap.set(target, nestedString);
            }
            text = nestedString.map((a, idx) => {
                const isArray = Array.isArray(a);
                let s = (isArray ? a[0] : a).trimEnd();
                //let src = ctx.host as HTMLElement[];
                let count = -1;
                while (s[0] === '.') {
                    count++;
                    s = s.substr(1);
                }
                if (count > -1 && host.length > count) {
                    const src = host[count];
                    const frstItem = src[s];
                    if (!isArray) {
                        return frstItem;
                    }
                    else {
                        return (frstItem === undefined || frstItem === null) ? a[1].trimEnd() : frstItem;
                    }
                }
                else {
                    if (idx % 2 === 1) {
                        return '|' + s + '|';
                    }
                    else {
                        return s;
                    }
                }
            }).join('');
        }
        target.textContent = text;
    }
}
