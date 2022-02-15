//copied from pass-up initially
export function doInvoke(match, fn, val, withArgs, event) {
    const args = [];
    const copyArgs = withArgs || ['self', 'val', 'event'];
    for (const arg of copyArgs) {
        switch (arg) {
            case 'self':
                args.push(match);
                break;
            case 'val':
                args.push(val);
                break;
            case 'event':
                args.push(event);
                break;
        }
    }
    match[fn](...args);
}
