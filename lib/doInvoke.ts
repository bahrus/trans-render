//copied from pass-up initially
export function doInvoke(match: any, fn: string, val: any, withArgs: string[] | undefined, event?: Event){
    const args = [];
    const copyArgs = withArgs || ['self', 'val', 'event'];
    for(const arg of copyArgs){
        switch(arg){
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